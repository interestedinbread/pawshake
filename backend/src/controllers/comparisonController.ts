import { Request, Response } from 'express';
import { db } from '../db/db';
import { comparePoliciesForQuestion } from '../services/policyComparisonService';

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
export const askComparisonQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { policyId1, policyId2, question } = req.body as {
      policyId1?: string;
      policyId2?: string;
      question?: string;
    };

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

    const policyResult = await db.query(policyQuery, [policyId1, policyId2, userId]);

    if (policyResult.rows.length !== 2) {
      const foundIds = policyResult.rows.map((row) => row.id);
      const missingIds = [policyId1, policyId2].filter((id) => !foundIds.includes(id));

      res.status(404).json({
        error: 'Policy not found or access denied',
        message: `The following policy IDs were not found or you don't have access: ${missingIds.join(
          ', '
        )}`,
      });
      return;
    }

    // Map to get stable ordering and names
    const policy1Row = policyResult.rows.find((row) => row.id === policyId1)!;
    const policy2Row = policyResult.rows.find((row) => row.id === policyId2)!;

    const policy1Name: string = policy1Row.name;
    const policy2Name: string = policy2Row.name;

    // Delegate to comparison service to generate answer
    const comparisonAnswer = await comparePoliciesForQuestion(
      policyId1,
      policyId2,
      question.trim(),
      policy1Name,
      policy2Name
    );

    res.status(200).json(comparisonAnswer);
  } catch (err) {
    console.error('Error handling comparison question:', err);
    res.status(500).json({
      error: 'Failed to answer comparison question',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};


