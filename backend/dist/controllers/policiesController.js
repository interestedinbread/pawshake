"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePolicies = exports.reExtractPolicySummary = exports.getPolicies = exports.deletePolicy = exports.updatePolicyName = exports.createPolicy = void 0;
exports.extractAndSavePolicySummary = extractAndSavePolicySummary;
const db_1 = require("../db/db");
const vectorService_1 = require("../services/vectorService");
const extractionService_1 = require("../services/extractionService");
const logger_1 = __importDefault(require("../utils/logger"));
const createPolicy = async (req, res) => {
    try {
        const { name, description } = req.body;
        const user_id = req.userId;
        if (!user_id) {
            res.status(400).json({ error: 'User ID required' });
            return;
        }
        if (!name || name.trim() === '') {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        const policyQuery = `
        INSERT INTO policies (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, created_at, updated_at;
        `;
        const response = await db_1.db.query(policyQuery, [user_id, name, description || null]);
        res.status(201).json({ result: response.rows[0] });
    }
    catch (err) {
        logger_1.default.error('Error creating policy', {
            userId: req.userId || 'unknown',
            policyName: req.body?.name || 'unknown',
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to create policy',
            message: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.createPolicy = createPolicy;
const updatePolicyName = async (req, res) => {
    try {
        const { policyId } = req.params;
        const { name } = req.body;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        if (!policyId) {
            res.status(400).json({ error: "Policy ID is required" });
            return;
        }
        if (!name || name.trim() === '') {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        // Check if policy exists and belongs to user
        const policyCheckQuery = `
        SELECT id FROM policies WHERE id = $1 AND user_id = $2
        `;
        const policyCheckResult = await db_1.db.query(policyCheckQuery, [policyId, userId]);
        if (policyCheckResult.rows.length === 0) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        // Update the policy name
        const updateQuery = `
        UPDATE policies 
        SET name = $1, updated_at = now()
        WHERE id = $2 AND user_id = $3
        RETURNING id, name, description, created_at, updated_at;
        `;
        const updateResult = await db_1.db.query(updateQuery, [name.trim(), policyId, userId]);
        res.status(200).json({ policy: updateResult.rows[0] });
    }
    catch (err) {
        logger_1.default.error('Failed to update policy name', {
            policyId: req.params.policyId || 'unknown',
            userId: req.userId || 'unknown',
            newName: req.body?.name || 'unknown',
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to update policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.updatePolicyName = updatePolicyName;
const deletePolicy = async (req, res) => {
    try {
        const { policyId } = req.params;
        const userId = req.userId;
        if (!policyId) {
            res.status(400).json({ error: 'Policy ID required' });
            return;
        }
        if (!userId || userId.trim() === '') {
            res.status(400).json({ error: 'User ID required' });
            return;
        }
        // Check if policy exists and belongs to user
        const policyCheckQuery = `
        SELECT id FROM policies WHERE id = $1 AND user_id = $2
        `;
        const policyCheckResult = await db_1.db.query(policyCheckQuery, [policyId, userId]);
        if (policyCheckResult.rows.length === 0) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        // Get document count before deletion (for response)
        const docCountResult = await db_1.db.query('SELECT COUNT(*) as count FROM documents WHERE policy_id = $1', [policyId]);
        const documentCount = Number(docCountResult.rows[0]?.count || 0);
        // Delete ChromaDB embeddings for this policy
        let deletedChunks = 0;
        try {
            deletedChunks = await (0, vectorService_1.deleteChunksByPolicyId)(policyId);
        }
        catch (chromaError) {
            // Log error but don't fail the deletion
            // Database deletion will still proceed
            console.warn('Failed to delete ChromaDB chunks (database deletion will proceed):', chromaError);
        }
        // Delete policy from database (CASCADE will delete documents and summaries)
        const deleteQuery = `
            DELETE FROM policies WHERE id = $1 AND user_id = $2
        `;
        const result = await db_1.db.query(deleteQuery, [policyId, userId]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        res.status(200).json({
            message: 'Policy deleted successfully',
            policyId,
            deletedDocuments: documentCount,
            deletedChunks,
        });
    }
    catch (err) {
        logger_1.default.error('Failed to delete policy', {
            policyId: req.params.policyId || 'unknown',
            userId: req.userId || 'unknown',
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to delete policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.deletePolicy = deletePolicy;
const getPolicies = async (req, res) => {
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
        const policiesResult = await db_1.db.query(policiesQuery, [userId]);
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
    }
    catch (error) {
        logger_1.default.error('Error fetching policies', {
            userId: req.userId || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to fetch policies',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getPolicies = getPolicies;
/**
 * Extract and save policy summary from all documents in a policy
 * This function aggregates text from all documents and extracts a summary
 * @param policyId - The policy ID
 * @param userId - The user ID (for authorization)
 * @returns The extracted policy summary
 * @throws Error if policy not found, no documents, or extraction fails
 */
async function extractAndSavePolicySummary(policyId, userId) {
    // Verify policy exists and belongs to user
    const policyCheck = await db_1.db.query(`SELECT id, name FROM policies WHERE id = $1 AND user_id = $2`, [policyId, userId]);
    if (policyCheck.rows.length === 0) {
        throw new Error('Policy not found or access denied');
    }
    // Fetch all documents for this policy
    const policyDocumentsResult = await db_1.db.query(`
      SELECT id, filename, extracted_text, page_count, document_type, created_at
      FROM documents
      WHERE policy_id = $1 AND user_id = $2
      ORDER BY created_at ASC
    `, [policyId, userId]);
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
    const aggregatedPageCount = policyDocumentsResult.rows.reduce((sum, docRow) => {
        const pages = typeof docRow.page_count === 'number' ? docRow.page_count : 0;
        return sum + pages;
    }, 0);
    // Use the first document ID for summary tracking
    const firstDocumentId = policyDocumentsResult.rows[0].id;
    // Extract policy summary using LLM
    const policySummary = await (0, extractionService_1.extractPolicySummary)(aggregatedText, firstDocumentId, policyId, aggregatedPageCount);
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
    await db_1.db.query(summaryInsertQuery, [
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
const reExtractPolicySummary = async (req, res) => {
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
    }
    catch (error) {
        logger_1.default.error('Error re-extracting policy summary', {
            policyId: req.params.policyId || 'unknown',
            userId: req.userId || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
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
exports.reExtractPolicySummary = reExtractPolicySummary;
const comparePolicies = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        // Get policy IDs from query parameters
        const { policyId1, policyId2 } = req.query;
        if (!policyId1 || !policyId2) {
            res.status(400).json({
                error: 'Both policy IDs are required',
                message: 'Provide policyId1 and policyId2 as query parameters',
            });
            return;
        }
        // Validate both policies are different
        if (policyId1 === policyId2) {
            res.status(400).json({
                error: 'Policy IDs must be different',
                message: 'Cannot compare a policy to itself',
            });
            return;
        }
        // Verify both policies exist and belong to user
        const policyCheckQuery = `
      SELECT id, name, description, created_at, updated_at
      FROM policies
      WHERE id IN ($1, $2) AND user_id = $3
    `;
        const policyCheckResult = await db_1.db.query(policyCheckQuery, [policyId1, policyId2, userId]);
        if (policyCheckResult.rows.length !== 2) {
            // Check which policy is missing
            const foundIds = policyCheckResult.rows.map((row) => row.id);
            const missingIds = [policyId1, policyId2].filter((id) => !foundIds.includes(id));
            res.status(404).json({
                error: 'Policy not found or access denied',
                message: `The following policy IDs were not found or you don't have access: ${missingIds.join(', ')}`,
            });
            return;
        }
        // Fetch policy summaries for both policies
        const summaryQuery = `
      SELECT 
        ps.policy_id,
        ps.summary_data,
        ps.created_at AS summary_created_at,
        ps.updated_at AS summary_updated_at,
        p.name AS policy_name
      FROM policy_summaries ps
      INNER JOIN policies p ON ps.policy_id = p.id
      WHERE ps.policy_id IN ($1, $2) AND p.user_id = $3
    `;
        const summaryResult = await db_1.db.query(summaryQuery, [policyId1, policyId2, userId]);
        // Build response with policy data
        const policies = policyCheckResult.rows.map((policyRow) => {
            const summaryRow = summaryResult.rows.find((row) => row.policy_id === policyRow.id);
            const summaryData = summaryRow?.summary_data
                ? typeof summaryRow.summary_data === 'string'
                    ? JSON.parse(summaryRow.summary_data)
                    : summaryRow.summary_data
                : null;
            const overallConfidence = summaryData?.confidence?.overall ?? null;
            const item = {
                id: policyRow.id,
                name: policyRow.name,
                description: policyRow.description,
                createdAt: policyRow.created_at,
                updatedAt: policyRow.updated_at,
                summary: summaryData,
                summaryMetadata: summaryRow
                    ? {
                        createdAt: summaryRow.summary_created_at,
                        updatedAt: summaryRow.summary_updated_at,
                        confidence: overallConfidence,
                    }
                    : null,
                hasSummary: Boolean(summaryData),
            };
            return item;
        });
        // Check if both policies have summaries
        const policiesWithoutSummaries = policies.filter((p) => !p.hasSummary);
        if (policiesWithoutSummaries.length > 0) {
            res.status(400).json({
                error: 'One or more policies lack summaries',
                message: `The following policies do not have summaries yet: ${policiesWithoutSummaries.map((p) => p.name).join(', ')}. Please ensure policies have been processed.`,
                policies,
            });
            return;
        }
        // Return comparison data
        const response = {
            policies,
            comparisonReady: true,
        };
        res.status(200).json(response);
    }
    catch (err) {
        logger_1.default.error('Error comparing policies', {
            userId: req.userId || 'unknown',
            policyId1: req.query?.policyId1 || 'unknown',
            policyId2: req.query?.policyId2 || 'unknown',
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to compare policies',
            message: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.comparePolicies = comparePolicies;
//# sourceMappingURL=policiesController.js.map