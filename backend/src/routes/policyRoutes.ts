import { createPolicy, updatePolicyName, deletePolicy } from "../controllers/policiesController";
import { getPolicies, getPolicyDocuments, getPolicySummary } from "../controllers/documentController";
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router()

// List all policies for authenticated user
router.get('/', authenticateToken, getPolicies);

// Create a new policy
router.post('/', authenticateToken, createPolicy);

// Get policy summary
router.get('/:policyId/summary', authenticateToken, getPolicySummary);

// Get documents in a policy
router.get('/:policyId/documents', authenticateToken, getPolicyDocuments);

// Update policy name
router.patch('/:policyId', authenticateToken, updatePolicyName);

router.delete('/:policyId', authenticateToken, deletePolicy)

export default router;