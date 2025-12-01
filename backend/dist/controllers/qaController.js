"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswer = void 0;
const qaService_1 = require("../services/qaService");
const logger_1 = __importDefault(require("../utils/logger"));
const getAnswer = async (req, res) => {
    const { question, documentId, policyId } = req.body;
    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({ error: 'Question is required and must be a non-empty string' });
        return;
    }
    if (!policyId && !documentId) {
        res.status(400).json({ error: 'Provide either a policyId or documentId to scope the question.' });
        return;
    }
    try {
        const qaResponse = await (0, qaService_1.answerQuestion)(question, documentId, policyId);
        res.status(200).json(qaResponse);
    }
    catch (err) {
        logger_1.default.error('Error answering question', {
            userId: req.userId || 'unknown',
            policyId: req.body?.policyId || null,
            documentId: req.body?.documentId || null,
            question: req.body?.question?.substring(0, 100) || 'unknown', // Log first 100 chars
            error: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
        });
        res.status(500).json({
            error: 'Failed to generate answer',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getAnswer = getAnswer;
//# sourceMappingURL=qaController.js.map