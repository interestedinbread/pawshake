/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { extractTextFromPDF } from '../services/documentServices';
import { chunkDocument } from '../services/chunkingService';
import { storeChunks } from '../services/vectorService';
import { extractPolicySummary } from '../services/extractionService';
import { db } from '../db/db';

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Validate file type (PDF only)
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Only PDF files are allowed' });
      return;
    }

    // Get user ID from auth middleware
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Determine policy (existing or new)
    const requestedPolicyId = (req.body.policyId as string | undefined)?.trim();
    const policyName = (req.body.policyName as string | undefined)?.trim();
    const policyDescription = (req.body.policyDescription as string | undefined)?.trim();

    let policyId: string;
    let policyNameResolved: string | null = null;

    if (requestedPolicyId) {
      const policyLookup = await db.query(
        `SELECT id, name FROM policies WHERE id = $1 AND user_id = $2`,
        [requestedPolicyId, userId]
      );

      if (policyLookup.rows.length === 0) {
        res.status(404).json({
          error: 'Policy not found',
          message: 'The specified policy does not exist or you do not have access to it.',
        });
        return;
      }

      policyId = policyLookup.rows[0].id;
      policyNameResolved = policyLookup.rows[0].name;
    } else {
      const generatedName = policyName || req.file.originalname.replace(/\.pdf$/i, '');
      const newPolicy = await db.query(
        `
          INSERT INTO policies (user_id, name, description)
          VALUES ($1, $2, $3)
          RETURNING id, name
        `,
        [userId, generatedName, policyDescription || null]
      );

      policyId = newPolicy.rows[0].id;
      policyNameResolved = newPolicy.rows[0].name;
    }

    // Extract text from PDF
    const pdfBuffer = req.file.buffer;
    const extractedData = await extractTextFromPDF(pdfBuffer);

    // Save document to database
    const insertQuery = `
      INSERT INTO documents (user_id, policy_id, filename, extracted_text, page_count, document_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, filename, page_count, document_type, created_at
    `;

    const result = await db.query(insertQuery, [
      userId,
      policyId,
      req.file.originalname,
      extractedData.text,
      extractedData.pageCount,
      'policy', // Default document type
    ]);

    const document = result.rows[0];

    // Chunk the document and store in vector database
    const chunks = await chunkDocument(extractedData.text, extractedData.pageCount, document.id, policyId);
    await storeChunks(chunks, document.id, policyId);

    // Fetch all documents for this policy to build aggregated summary context
    const policyDocumentsResult = await db.query(
      `
        SELECT id, filename, extracted_text, page_count, document_type, created_at
        FROM documents
        WHERE policy_id = $1 AND user_id = $2
        ORDER BY created_at ASC
      `,
      [policyId, userId]
    );

    const aggregatedText = policyDocumentsResult.rows
      .map((docRow) => `Document: ${docRow.filename}\n\n${docRow.extracted_text}`)
      .join('\n\n------------------------------\n\n');

    const aggregatedPageCount = policyDocumentsResult.rows.reduce<number>((sum, docRow) => {
      const pages = typeof docRow.page_count === 'number' ? docRow.page_count : 0;
      return sum + pages;
    }, 0) || extractedData.pageCount;

    // Extract policy summary (non-blocking - if it fails, upload still succeeds)
    let policySummary = null;
    try {
      policySummary = await extractPolicySummary(
        aggregatedText,
        document.id,
        policyId,
        aggregatedPageCount
      );

      // Save policy summary to database (policy-level)
      if (policySummary) {
        const summaryInsertQuery = `
          INSERT INTO policy_summaries (policy_id, document_id, summary_data)
          VALUES ($1, $2, $3)
          ON CONFLICT (policy_id)
          DO UPDATE SET
            summary_data = EXCLUDED.summary_data,
            document_id = EXCLUDED.document_id,
            updated_at = now()
          RETURNING id, created_at, updated_at
        `;

        await db.query(summaryInsertQuery, [
          policyId,
          document.id,
          JSON.stringify(policySummary),
        ]);
      }
    } catch (extractionError) {
      // Log error but don't fail the upload
      console.warn('Policy extraction failed (document upload still succeeded):', extractionError);
    }

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      policy: {
        id: policyId,
        name: policyNameResolved,
      },
      document: {
        id: document.id,
        filename: document.filename,
        pageCount: document.page_count,
        documentType: document.document_type,
        createdAt: document.created_at,
      },
      documents: policyDocumentsResult.rows.map((docRow) => ({
        id: docRow.id,
        filename: docRow.filename,
        pageCount: docRow.page_count,
        documentType: docRow.document_type,
        createdAt: docRow.created_at,
      })),
      ...(policySummary && { policySummary }), // Include policy summary if extraction succeeded
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      error: 'Failed to process document',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get policy summary for a specific document
 */
export const getPolicySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { policyId, documentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    let resolvedPolicyId: string | null = policyId ?? null;
    let resolvedDocumentId: string | null = documentId ?? null;

    if (!resolvedPolicyId && resolvedDocumentId) {
      const documentLookup = await db.query(
        `SELECT policy_id FROM documents WHERE id = $1 AND user_id = $2`,
        [resolvedDocumentId, userId]
      );

      if (documentLookup.rows.length === 0) {
        res.status(404).json({
          error: 'Document not found',
          message: 'No document exists with this ID, or you do not have access to it.',
        });
        return;
      }

      resolvedPolicyId = documentLookup.rows[0].policy_id;
    }

    if (!resolvedPolicyId) {
      res.status(400).json({
        error: 'Policy ID is required',
        message: 'Provide a policyId parameter or upload documents into a policy bundle first.',
      });
      return;
    }

    const summaryQuery = `
      SELECT ps.summary_data, ps.created_at, ps.updated_at, p.name AS policy_name
      FROM policy_summaries ps
      INNER JOIN policies p ON ps.policy_id = p.id
      WHERE ps.policy_id = $1 AND p.user_id = $2
    `;

    const summaryResult = await db.query(summaryQuery, [resolvedPolicyId, userId]);

    if (summaryResult.rows.length === 0) {
      // Fallback: legacy single-document summary lookup
      if (resolvedDocumentId) {
        const legacyQuery = `
          SELECT ps.summary_data, ps.created_at, ps.updated_at
          FROM policy_summaries ps
          INNER JOIN documents d ON ps.document_id = d.id
          WHERE ps.document_id = $1 AND d.user_id = $2
        `;

        const legacyResult = await db.query(legacyQuery, [resolvedDocumentId, userId]);

        if (legacyResult.rows.length === 0) {
          res.status(404).json({
            error: 'Policy summary not found',
            message: 'No policy summary exists for this policy yet.',
          });
          return;
        }

        const legacyRow = legacyResult.rows[0];
        const legacySummary = typeof legacyRow.summary_data === 'string'
          ? JSON.parse(legacyRow.summary_data)
          : legacyRow.summary_data;

        res.status(200).json({
          summary: legacySummary,
          metadata: {
            createdAt: legacyRow.created_at,
            updatedAt: legacyRow.updated_at,
          },
        });
        return;
      }

      res.status(404).json({
        error: 'Policy summary not found',
        message: 'No policy summary exists for this policy yet.',
      });
      return;
    }

    const summaryRow = summaryResult.rows[0];
    const summaryData = typeof summaryRow.summary_data === 'string'
      ? JSON.parse(summaryRow.summary_data)
      : summaryRow.summary_data;

    const documentsResult = await db.query(
      `
        SELECT id, filename, page_count, document_type, created_at
        FROM documents
        WHERE policy_id = $1 AND user_id = $2
        ORDER BY created_at ASC
      `,
      [resolvedPolicyId, userId]
    );

    res.status(200).json({
      policy: {
        id: resolvedPolicyId,
        name: summaryRow.policy_name ?? null,
      },
      summary: summaryData,
      metadata: {
        createdAt: summaryRow.created_at,
        updatedAt: summaryRow.updated_at,
      },
      documents: documentsResult.rows.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        pageCount: doc.page_count,
        documentType: doc.document_type,
        createdAt: doc.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching policy summary:', error);
    res.status(500).json({
      error: 'Failed to fetch policy summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getPolicies = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const policiesQuery = `
      SELECT
        id,
        name,
        description,
        created_at,
        updated_at
      FROM policies
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const policiesResult = await db.query(policiesQuery, [userId]);

    res.status(200).json({
      policies: policiesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      error: 'Failed to fetch policies',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getPolicyDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { policyId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!policyId) {
      res.status(400).json({ error: 'Policy ID is required' });
      return;
    }

    const policyLookup = await db.query(
      `SELECT id, name, description, created_at, updated_at FROM policies WHERE id = $1 AND user_id = $2`,
      [policyId, userId]
    );

    if (policyLookup.rows.length === 0) {
      res.status(404).json({
        error: 'Policy not found',
        message: 'No policy exists with this ID, or you do not have access to it.',
      });
      return;
    }

    const documentsQuery = `
      SELECT id, filename, page_count, document_type, created_at, updated_at
      FROM documents
      WHERE policy_id = $1 AND user_id = $2
      ORDER BY created_at ASC
    `;

    const documentsResult = await db.query(documentsQuery, [policyId, userId]);

    res.status(200).json({
      policy: policyLookup.rows[0],
      documents: documentsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching policy documents:', error);
    res.status(500).json({
      error: 'Failed to fetch policy documents',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};