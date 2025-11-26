"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const documentController_1 = require("../controllers/documentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Configure multer for memory storage (stores file in buffer)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Protect route with auth middleware, then handle file upload
router.post('/upload', authMiddleware_1.authenticateToken, upload.array('files', 10), documentController_1.uploadDocument);
// Delete a document
router.delete('/:documentId', authMiddleware_1.authenticateToken, documentController_1.deleteDocument);
exports.default = router;
//# sourceMappingURL=documentRoutes.js.map