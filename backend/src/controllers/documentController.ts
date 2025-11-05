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

    // Extract text from PDF
    const pdfBuffer = req.file.buffer;
    const extractedData = await extractTextFromPDF(pdfBuffer);

    // Save document to database
    const insertQuery = `
      INSERT INTO documents (user_id, filename, extracted_text, page_count, document_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, filename, page_count, document_type, created_at
    `;

    const result = await db.query(insertQuery, [
      userId,
      req.file.originalname,
      extractedData.text,
      extractedData.pageCount,
      'policy' // Default document type
    ]);

    const document = result.rows[0];

    // Chunk the document and store in vector database
    const chunks = await chunkDocument(extractedData.text, extractedData.pageCount, document.id);
    await storeChunks(chunks, document.id);

    // Extract policy summary (non-blocking - if it fails, upload still succeeds)
    let policySummary = null;
    try {
      policySummary = await extractPolicySummary(
        extractedData.text,
        document.id,
        extractedData.pageCount
      );

      // Save policy summary to database
      if (policySummary) {
        const summaryInsertQuery = `
          INSERT INTO policy_summaries (document_id, summary_data)
          VALUES ($1, $2)
          ON CONFLICT (document_id) 
          DO UPDATE SET 
            summary_data = EXCLUDED.summary_data,
            updated_at = now()
          RETURNING id, created_at
        `;

        await db.query(summaryInsertQuery, [
          document.id,
          JSON.stringify(policySummary)
        ]);
      }
    } catch (extractionError) {
      // Log error but don't fail the upload
      console.warn('Policy extraction failed (document upload still succeeded):', extractionError);
    }

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document.id,
        filename: document.filename,
        pageCount: document.page_count,
        documentType: document.document_type,
        createdAt: document.created_at
      },
      ...(policySummary && { policySummary }) // Include policy summary if extraction succeeded
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get policy summary for a specific document
 */
export const getPolicySummary = async (req: Request, res: Response): Promise<void> => {
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

    // Verify document belongs to user and fetch summary
    const query = `
      SELECT ps.summary_data, ps.created_at, ps.updated_at
      FROM policy_summaries ps
      INNER JOIN documents d ON ps.document_id = d.id
      WHERE ps.document_id = $1 AND d.user_id = $2
    `;

    const result = await db.query(query, [documentId, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ 
        error: 'Policy summary not found',
        message: 'No policy summary exists for this document, or you do not have access to it.'
      });
      return;
    }

    const summaryRow = result.rows[0];
    
    // Parse JSONB data
    const summaryData = typeof summaryRow.summary_data === 'string' 
      ? JSON.parse(summaryRow.summary_data) 
      : summaryRow.summary_data;

    res.status(200).json({
      summary: summaryData,
      metadata: {
        createdAt: summaryRow.created_at,
        updatedAt: summaryRow.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching policy summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch policy summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

