import { Router } from "express";
import multer from "multer";
import { uploadDocument, getPolicySummary } from "../controllers/documentController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Configure multer for memory storage (stores file in buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Protect route with auth middleware, then handle file upload
router.post('/upload', authenticateToken, upload.single('file'), uploadDocument);

// Get policy summary (preferred policy-based route)
router.get('/policy/:policyId/summary', authenticateToken, getPolicySummary);

// Legacy: Get policy summary by document (fallback support)
router.get('/:documentId/summary', authenticateToken, getPolicySummary);

export default router;
