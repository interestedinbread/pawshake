import { Request, Response } from 'express'
import { answerQuestion } from '../services/qaService'
import logger from '../utils/logger'

export const getAnswer = async (req: Request, res: Response): Promise<void> => {
    
    const { question, documentId, policyId } = req.body
    
    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        res.status(400).json({ error: 'Question is required and must be a non-empty string' });
        return;
    }

    if (!policyId && !documentId) {
        res.status(400).json({ error: 'Provide either a policyId or documentId to scope the question.' });
        return;
    }
    
    try{
        const qaResponse = await answerQuestion(question, documentId, policyId)
        res.status(200).json(qaResponse)

    } catch (err) {
        logger.error('Error answering question', {
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
}