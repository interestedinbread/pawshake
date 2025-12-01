"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askComparisonQuestion = void 0;
const db_1 = require("../db/db");
const policyComparisonService_1 = require("../services/policyComparisonService");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Handle comparison questions between two policies.
 *
 * Expected body:
 * {
 *   "policyId1": "uuid",
 *   "policyId2": "uuid",
 *   "question": "How do these policies handle pre-existing conditions?"
 * }
 *
 * Response:
 * {
 *   "answer": string,
 *   "sources": {
 *     "policy1": [{ "pageNumber"?: number, "documentId"?: string }],
 *     "policy2": [{ "pageNumber"?: number, "documentId"?: string }]
 *   }
 * }
 */
const askComparisonQuestion = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { policyId1, policyId2, question } = req.body;
        // Validate question
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            res
                .status(400)
                .json({ error: 'Question is required and must be a non-empty string' });
            return;
        }
        // Validate policy IDs
        if (!policyId1 || !policyId2) {
            res.status(400).json({
                error: 'Both policy IDs are required',
                message: 'Provide policyId1 and policyId2 in the request body',
            });
            return;
        }
        if (policyId1 === policyId2) {
            res.status(400).json({
                error: 'Policy IDs must be different',
                message: 'Cannot compare a policy to itself',
            });
            return;
        }
        // Verify both policies exist and belong to the authenticated user
        const policyQuery = `
      SELECT id, name
      FROM policies
      WHERE id IN ($1, $2) AND user_id = $3
    `;
        const policyResult = await db_1.db.query(policyQuery, [policyId1, policyId2, userId]);
        if (policyResult.rows.length !== 2) {
            const foundIds = policyResult.rows.map((row) => row.id);
            const missingIds = [policyId1, policyId2].filter((id) => !foundIds.includes(id));
            res.status(404).json({
                error: 'Policy not found or access denied',
                message: `The following policy IDs were not found or you don't have access: ${missingIds.join(', ')}`,
            });
            return;
        }
        // Map to get stable ordering and names
        const policy1Row = policyResult.rows.find((row) => row.id === policyId1);
        const policy2Row = policyResult.rows.find((row) => row.id === policyId2);
        const policy1Name = policy1Row.name;
        const policy2Name = policy2Row.name;
        // Delegate to comparison service to generate answer
        const comparisonAnswer = await (0, policyComparisonService_1.comparePoliciesForQuestion)(policyId1, policyId2, question.trim(), policy1Name, policy2Name);
        res.status(200).json(comparisonAnswer);
    }
    catch (err) {
        logger_1.default.error('Error handling comparison question', {
            userId: req.userId || 'unknown',
            policyId1: req.body?.policyId1 || 'unknown',
            policyId2: req.body?.policyId2 || 'unknown',
            question: req.body?.question?.substring(0, 100) || 'unknown', // Log first 100 chars
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to answer comparison question',
            message: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.askComparisonQuestion = askComparisonQuestion;
//# sourceMappingURL=comparisonController.js.map