"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnswer = void 0;
const qaService_1 = require("../services/qaService");
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
        console.error('Error answering question:', err);
        res.status(500).json({
            error: 'Failed to generate answer',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
};
exports.getAnswer = getAnswer;
//# sourceMappingURL=qaController.js.map