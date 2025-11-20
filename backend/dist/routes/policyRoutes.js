"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const policiesController_1 = require("../controllers/policiesController");
const documentController_1 = require("../controllers/documentController");
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// List all policies for authenticated user
router.get('/', authMiddleware_1.authenticateToken, policiesController_1.getPolicies);
// Compare policies
router.get('/compare', authMiddleware_1.authenticateToken, policiesController_1.comparePolicies);
// Create a new policy
router.post('/', authMiddleware_1.authenticateToken, policiesController_1.createPolicy);
// Get policy summary
router.get('/:policyId/summary', authMiddleware_1.authenticateToken, documentController_1.getPolicySummary);
// Re-extract policy summary
router.post('/:policyId/summary/extract', authMiddleware_1.authenticateToken, policiesController_1.reExtractPolicySummary);
// Get documents in a policy
router.get('/:policyId/documents', authMiddleware_1.authenticateToken, documentController_1.getPolicyDocuments);
// Update policy name
router.patch('/:policyId', authMiddleware_1.authenticateToken, policiesController_1.updatePolicyName);
router.delete('/:policyId', authMiddleware_1.authenticateToken, policiesController_1.deletePolicy);
exports.default = router;
//# sourceMappingURL=policyRoutes.js.map