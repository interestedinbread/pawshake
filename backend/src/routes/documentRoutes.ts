import { Router } from "express";
import multer from "multer";
import { uploadDocument, getPolicySummary, deleteDocument } from "../controllers/documentController";
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
router.post('/upload', authenticateToken, upload.array('files', 10), uploadDocument);

// Delete a document
router.delete('/:documentId', authenticateToken, deleteDocument);

export default router;
