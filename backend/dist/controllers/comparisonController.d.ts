import { Request, Response } from 'express';
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
export declare const askComparisonQuestion: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=comparisonController.d.ts.map