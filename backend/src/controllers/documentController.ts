/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { extractTextFromPDF } from '../services/documentServices';
import { chunkDocument } from '../services/chunkingService';
import { storeChunks } from '../services/vectorService';
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

    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document.id,
        filename: document.filename,
        pageCount: document.page_count,
        documentType: document.document_type,
        createdAt: document.created_at
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      error: 'Failed to process document',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

