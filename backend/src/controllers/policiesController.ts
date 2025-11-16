/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express'
import { db } from '../db/db'
import { deleteChunksByPolicyId } from '../services/vectorService'
import { extractPolicySummary } from '../services/extractionService'
import { PolicySummary } from '../types/policySummary'

export const createPolicy = async (req: Request, res: Response) => {

    try{
        const { name, description } = req.body
        const user_id = req.userId

        if(!user_id){
            res.status(400).json({ error: 'User ID required'})
            return
        }
        
        if(!name || name.trim() === ''){
            res.status(400).json({ error: "Name is required"})
            return
        }

        const policyQuery = `
        INSERT INTO policies (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, created_at, updated_at;
        `

        const response = await db.query(policyQuery, [user_id, name, description || null])
        res.status(201).json({ result: response.rows[0]})

    } catch (err) {
        console.error('Error creating policy:', err)
        res.status(500).json({
            error: 'Failed to create policy',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
    }
}

export const updatePolicyName = async (req: Request, res: Response) => {
    try{
        const { policyId } = req.params
        const { name } = req.body
        const userId = req.userId

        if(!userId){
            res.status(401).json({ error: 'User not authenticated'})
            return 
        }

        if(!policyId){
            res.status(400).json({ error: "Policy ID is required"})
            return 
        }

        if(!name || name.trim() === ''){
            res.status(400).json({ error: "Name is required"})
            return
        }

        // Check if policy exists and belongs to user
        const policyCheckQuery = `
        SELECT id FROM policies WHERE id = $1 AND user_id = $2
        `

        const policyCheckResult = await db.query(policyCheckQuery, [policyId, userId])

        if(policyCheckResult.rows.length === 0){
            res.status(404).json({ error: 'Policy not found'})
            return
        }

        // Update the policy name
        const updateQuery = `
        UPDATE policies 
        SET name = $1, updated_at = now()
        WHERE id = $2 AND user_id = $3
        RETURNING id, name, description, created_at, updated_at;
        `

        const updateResult = await db.query(updateQuery, [name.trim(), policyId, userId])
        res.status(200).json({ policy: updateResult.rows[0]})
    } catch (err) {
        console.error('Failed to update policy name', err)
        res.status(500).json({
            error: 'Failed to update policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        })
    }
}

export const deletePolicy = async (req: Request, res:Response) => {
    try{
        const { policyId } = req.params
        const userId = req.userId

        if(!policyId){
            res.status(400).json({ error: 'Policy ID required'})
            return
        }

        if(!userId || userId.trim() === ''){
            res.status(400).json({ error: 'User ID required'})
            return
        }

        // Check if policy exists and belongs to user
        const policyCheckQuery = `
        SELECT id FROM policies WHERE id = $1 AND user_id = $2
        `

        const policyCheckResult = await db.query(policyCheckQuery, [policyId, userId])

        if(policyCheckResult.rows.length === 0){
            res.status(404).json({ error: 'Policy not found'})
            return
        }

        // Get document count before deletion (for response)
        const docCountResult = await db.query(
            'SELECT COUNT(*) as count FROM documents WHERE policy_id = $1',
            [policyId]
        )
        const documentCount = Number(docCountResult.rows[0]?.count || 0)

        // Delete ChromaDB embeddings for this policy
        let deletedChunks = 0
        try {
            deletedChunks = await deleteChunksByPolicyId(policyId)
        } catch (chromaError) {
            // Log error but don't fail the deletion
            // Database deletion will still proceed
            console.warn('Failed to delete ChromaDB chunks (database deletion will proceed):', chromaError)
        }

        // Delete policy from database (CASCADE will delete documents and summaries)
        const deleteQuery = `
            DELETE FROM policies WHERE id = $1 AND user_id = $2
        `

        const result = await db.query(deleteQuery, [policyId, userId])
        
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Policy not found' })
            return
        }

        res.status(200).json({
            message: 'Policy deleted successfully',
            policyId,
            deletedDocuments: documentCount,
            deletedChunks,
        })
    } catch (err) {
        console.error('Failed to delete policy', err)
        res.status(500).json({
            error: 'Failed to delete policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        })
    }
}

export const getPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
  
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
  
      const policiesQuery = `
        SELECT
          p.id,
          p.name,
          p.description,
          p.created_at,
          p.updated_at,
          COUNT(d.id) AS document_count,
          MAX(d.created_at) AS last_document_at,
          ps.updated_at AS summary_updated_at,
          ps.summary_data
        FROM policies p
        LEFT JOIN documents d ON d.policy_id = p.id AND d.user_id = p.user_id
        LEFT JOIN policy_summaries ps ON ps.policy_id = p.id
        WHERE p.user_id = $1
        GROUP BY p.id, ps.updated_at, ps.summary_data
        ORDER BY p.created_at DESC
      `;
  
      const policiesResult = await db.query(policiesQuery, [userId]);
  
      const policies = policiesResult.rows.map((row) => {
        const summaryData = row.summary_data
          ? typeof row.summary_data === 'string'
            ? JSON.parse(row.summary_data)
            : row.summary_data
          : null;
  
        const overallConfidence = summaryData?.confidence?.overall ?? null;
  
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          documentCount: Number(row.document_count ?? 0),
          lastDocumentAt: row.last_document_at ?? null,
          summaryUpdatedAt: row.summary_updated_at ?? null,
          summaryConfidence: overallConfidence,
          hasSummary: Boolean(summaryData),
        };
      });
  
      res.status(200).json({ policies });
    } catch (error) {
      console.error('Error fetching policies:', error);
      res.status(500).json({
        error: 'Failed to fetch policies',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

/**
 * Extract and save policy summary from all documents in a policy
 * This function aggregates text from all documents and extracts a summary
 * @param policyId - The policy ID
 * @param userId - The user ID (for authorization)
 * @returns The extracted policy summary
 * @throws Error if policy not found, no documents, or extraction fails
 */
export async function extractAndSavePolicySummary(
  policyId: string,
  userId: string
): Promise<PolicySummary> {
  // Verify policy exists and belongs to user
  const policyCheck = await db.query(
    `SELECT id, name FROM policies WHERE id = $1 AND user_id = $2`,
    [policyId, userId]
  );

  if (policyCheck.rows.length === 0) {
    throw new Error('Policy not found or access denied');
  }

  // Fetch all documents for this policy
  const policyDocumentsResult = await db.query(
    `
      SELECT id, filename, extracted_text, page_count, document_type, created_at
      FROM documents
      WHERE policy_id = $1 AND user_id = $2
      ORDER BY created_at ASC
    `,
    [policyId, userId]
  );

  if (policyDocumentsResult.rows.length === 0) {
    throw new Error('No documents found for this policy');
  }

  // Prioritize documents: put declarations pages and similar key documents first
  const sortedDocuments = [...policyDocumentsResult.rows].sort((a, b) => {
    const aFilename = a.filename.toLowerCase();
    const bFilename = b.filename.toLowerCase();
    
    // Prioritize documents with "declaration", "summary", "coverage", "policy" in filename
    const priorityKeywords = ['declaration', 'summary', 'coverage', 'policy'];
    const aPriority = priorityKeywords.some(keyword => aFilename.includes(keyword)) ? 0 : 1;
    const bPriority = priorityKeywords.some(keyword => bFilename.includes(keyword)) ? 0 : 1;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority; // Lower priority number = higher priority
    }
    
    // If same priority, keep original order (by created_at)
    return 0;
  });

  // Aggregate text from all documents (prioritized order)
  const aggregatedText = sortedDocuments
    .map((docRow) => `Document: ${docRow.filename}\n\n${docRow.extracted_text}`)
    .join('\n\n------------------------------\n\n');

  // Calculate total page count
  const aggregatedPageCount = policyDocumentsResult.rows.reduce<number>((sum, docRow) => {
    const pages = typeof docRow.page_count === 'number' ? docRow.page_count : 0;
    return sum + pages;
  }, 0);

  // Use the first document ID for summary tracking
  const firstDocumentId = policyDocumentsResult.rows[0].id;

  // Extract policy summary using LLM
  const policySummary = await extractPolicySummary(
    aggregatedText,
    firstDocumentId,
    policyId,
    aggregatedPageCount
  );

  // Save policy summary to database
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

  return policySummary;
}

/**
 * Re-extract policy summary endpoint
 * Triggers a fresh extraction of the policy summary from all documents
 */
export const reExtractPolicySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { policyId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!policyId) {
      res.status(400).json({ error: 'Policy ID is required' });
      return;
    }

    // Extract and save the policy summary
    const policySummary = await extractAndSavePolicySummary(policyId, userId);

    res.status(200).json({
      message: 'Policy summary extracted successfully',
      summary: policySummary,
    });
  } catch (error) {
    console.error('Error re-extracting policy summary:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Policy not found or access denied') {
        res.status(404).json({ error: 'Policy not found' });
        return;
      }
      if (error.message === 'No documents found for this policy') {
        res.status(400).json({ error: 'No documents found for this policy' });
        return;
      }
    }

    res.status(500).json({
      error: 'Failed to extract policy summary',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};