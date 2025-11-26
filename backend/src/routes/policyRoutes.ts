import { createPolicy, updatePolicyName, getPolicies, deletePolicy, reExtractPolicySummary, comparePolicies } from "../controllers/policiesController";
import { getPolicyDocuments, getPolicySummary } from "../controllers/documentController";
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { askComparisonQuestion } from "../controllers/comparisonController";
import { checkCoverage } from "../controllers/coverageController";

const router = Router()

// List all policies for authenticated user
router.get('/', authenticateToken, getPolicies);

// Compare policies
router.get('/compare', authenticateToken, comparePolicies);

// Ask comparison question
router.post('/compare/ask', authenticateToken, askComparisonQuestion)

// Check coverage for an incident
router.post('/:policyId/coverage-check', authenticateToken, checkCoverage);

// Create a new policy
router.post('/', authenticateToken, createPolicy);

// Get policy summary
router.get('/:policyId/summary', authenticateToken, getPolicySummary);

// Re-extract policy summary
router.post('/:policyId/summary/extract', authenticateToken, reExtractPolicySummary);

// Get documents in a policy
router.get('/:policyId/documents', authenticateToken, getPolicyDocuments);

// Update policy name
router.patch('/:policyId', authenticateToken, updatePolicyName);

// Delete policy
router.delete('/:policyId', authenticateToken, deletePolicy)

export default router;