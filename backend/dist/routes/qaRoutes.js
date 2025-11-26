"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const qaController_1 = require("../controllers/qaController");
const router = (0, express_1.Router)();
router.post('/ask', authMiddleware_1.authenticateToken, qaController_1.getAnswer);
exports.default = router;
//# sourceMappingURL=qaRoutes.js.map