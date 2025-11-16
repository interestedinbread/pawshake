/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { extractTextFromPDF } from '../services/documentServices';
import { chunkDocument } from '../services/chunkingService';
import { storeChunks, deleteChunksByDocumentId } from '../services/vectorService';
import { extractPolicySummary } from '../services/extractionService';
import { db } from '../db/db';

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if files were uploaded
    // When using upload.array(), req.files is an array
    const files = Array.isArray(req.files) ? req.files : [];
    
    if (files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    // Validate each file (PDF only)
    for (const file of files) {
      if (file.mimetype !== 'application/pdf') {
        res.status(400).json({ 
          error: 'Only PDF files are allowed',
          message: `File "${file.originalname}" is not a PDF.`
        });
        return;
      }
    }

    // Get user ID from auth middleware
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Policy ID is required - users must create a policy first
    const policyId = (req.body.policyId as string | undefined)?.trim();
    if (!policyId) {
      res.status(400).json({
        error: 'Policy ID is required',
        message: 'You must create a policy first before uploading documents. Use POST /api/policies to create a new policy.',
      });
      return;
    }

    // Verify policy exists and belongs to the user
    const policyLookup = await db.query(
      `SELECT id, name FROM policies WHERE id = $1 AND user_id = $2`,
      [policyId, userId]
    );

    if (policyLookup.rows.length === 0) {
      res.status(404).json({
        error: 'Policy not found',
        message: 'The specified policy does not exist or you do not have access to it.',
      });
      return;
    }

    const policyNameResolved = policyLookup.rows[0].name;

    // Track results for each file
    const uploadResults: Array<{
      status: 'success' | 'error';
      document?: {
        id: string;
        filename: string;
        pageCount: number;
        documentType: string;
        createdAt: Date;
      };
      filename?: string;
      error?: string;
    }> = [];

    // Process each file
    for (const file of files) {
      try {
        // Extract text from PDF
        const pdfBuffer = file.buffer;
        const extractedData = await extractTextFromPDF(pdfBuffer);

        // Save document to database
        const insertQuery = `
        INSERT INTO documents (user_id, policy_id, filename, extracted_text, page_count, document_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, filename, page_count, document_type, created_at
        `;

        const insertResult = await db.query(insertQuery, [
          userId,
          policyId,
          file.originalname,
          extractedData.text,
          extractedData.pageCount,
          'policy', // Default document type
        ]);

        const document = insertResult.rows[0];
        
        // Chunk the document and store in vector database
        const chunks = await chunkDocument(
          extractedData.text,
          extractedData.pageCount,
          document.id,
          policyId
        );
        await storeChunks(chunks, document.id, policyId);

        // Track successful upload
        uploadResults.push({
          status: 'success',
          document: {
            id: document.id,
            filename: document.filename,
            pageCount: document.page_count,
            documentType: document.document_type,
            createdAt: document.created_at,
          },
        });
      } catch (err) {
        // Handle individual file errors (continue processing other files)
        console.error(`Error processing file ${file.originalname}:`, err);
        uploadResults.push({
          status: 'error',
          filename: file.originalname,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    
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
    }, 0);

    // Extract policy summary (non-blocking - if it fails, upload still succeeds)
    // Use the first document from the policy for summary tracking
    const firstDocumentId = policyDocumentsResult.rows.length > 0 
      ? policyDocumentsResult.rows[0].id 
      : null;
    
    let policySummary = null;
    if (firstDocumentId && aggregatedText) {
      try {
        policySummary = await extractPolicySummary(
          aggregatedText,
          firstDocumentId,
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
            firstDocumentId,
            JSON.stringify(policySummary),
          ]);
        }
      } catch (extractionError) {
        // Log error but don't fail the upload
        console.warn('Policy extraction failed (document upload still succeeded):', extractionError);
      }
    }

    // Calculate summary statistics
    const successful = uploadResults.filter(r => r.status === 'success').length;
    const failed = uploadResults.filter(r => r.status === 'error').length;

    res.status(201).json({
      message: 'File upload completed',
      policy: {
        id: policyId,
        name: policyNameResolved,
      },
      results: uploadResults,
      summary: {
        totalFiles: files.length,
        successful,
        failed,
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


export const getPolicySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { policyId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!policyId) {
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

    const summaryResult = await db.query(summaryQuery, [policyId, userId]);

    if(summaryResult.rows.length === 0){
      res.status(404).json({ error: "no summary available"})
      return
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
      [policyId, userId]
    );

    res.status(200).json({
      policy: {
        id: policyId,
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

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!documentId) {
      res.status(400).json({ error: 'Document ID is required' });
      return;
    }

    // Verify document exists and belongs to user, and get policyId
    const documentCheck = await db.query(
      `SELECT id, policy_id, filename FROM documents WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (documentCheck.rows.length === 0) {
      res.status(404).json({
        error: 'Document not found',
        message: 'No document exists with this ID, or you do not have access to it.',
      });
      return;
    }

    const document = documentCheck.rows[0];
    const policyId = document.policy_id;

    // Delete ChromaDB embeddings for this document
    let deletedChunks = 0;
    try {
      deletedChunks = await deleteChunksByDocumentId(documentId);
    } catch (chromaError) {
      // Log error but don't fail the deletion
      // Database deletion will still proceed
      console.warn('Failed to delete ChromaDB chunks (database deletion will proceed):', chromaError);
    }

    // Delete document from database
    const deleteQuery = `
      DELETE FROM documents WHERE id = $1 AND user_id = $2
    `;

    const deleteResult = await db.query(deleteQuery, [documentId, userId]);

    if (deleteResult.rowCount === 0) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Delete policy summary (will be re-extracted on next document upload)
    if (policyId) {
      try {
        await db.query(
          'DELETE FROM policy_summaries WHERE policy_id = $1',
          [policyId]
        );
      } catch (summaryError) {
        // Log error but don't fail the deletion
        // Document deletion already succeeded
        console.warn('Failed to delete policy summary (document deletion succeeded):', summaryError);
      }
    }

    res.status(200).json({
      message: 'Document deleted successfully',
      documentId,
      filename: document.filename,
      policyId: policyId || null,
      deletedChunks,
    });
  } catch (err) {
    console.error('Failed to delete document:', err);
    res.status(500).json({
      error: 'Failed to delete document',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};