import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getFormSchema, fillClaimForm } from '../controllers/claimController';

const router = Router();

// Get the Trupanion form schema
router.get('/form/schema', authenticateToken, getFormSchema);

// Fill the claim form with policy data
router.post('/form/fill', authenticateToken, fillClaimForm);

export default router;

