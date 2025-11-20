import { Request, Response } from 'express';
import { PolicySummary } from '../types/policySummary';
export declare const createPolicy: (req: Request, res: Response) => Promise<void>;
export declare const updatePolicyName: (req: Request, res: Response) => Promise<void>;
export declare const deletePolicy: (req: Request, res: Response) => Promise<void>;
export declare const getPolicies: (req: Request, res: Response) => Promise<void>;
/**
 * Extract and save policy summary from all documents in a policy
 * This function aggregates text from all documents and extracts a summary
 * @param policyId - The policy ID
 * @param userId - The user ID (for authorization)
 * @returns The extracted policy summary
 * @throws Error if policy not found, no documents, or extraction fails
 */
export declare function extractAndSavePolicySummary(policyId: string, userId: string): Promise<PolicySummary>;
/**
 * Re-extract policy summary endpoint
 * Triggers a fresh extraction of the policy summary from all documents
 */
export declare const reExtractPolicySummary: (req: Request, res: Response) => Promise<void>;
export declare const comparePolicies: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=policiesController.d.ts.map