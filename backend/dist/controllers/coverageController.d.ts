import { Request, Response } from 'express';
/**
 * Handle coverage analysis for an incident.
 *
 * Route: POST /api/policies/:policyId/coverage-check
 *
 * Expected body:
 * {
 *   "incidentDescription": "My dog broke his leg playing fetch"
 * }
 *
 * Response:
 * CoverageChecklist object with isCovered, confidence, requiredDocuments, actionSteps, etc.
 */
export declare const checkCoverage: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=coverageController.d.ts.map