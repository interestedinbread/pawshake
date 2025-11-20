"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const schema_1 = require("./db/schema");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const policyRoutes_1 = __importDefault(require("./routes/policyRoutes"));
const qaRoutes_1 = __importDefault(require("./routes/qaRoutes"));
const app = (0, express_1.default)();
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use((0, cors_1.default)({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '5mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '5mb' }));
app.get('/health', (_, res) => {
    res.json({
        status: 'ok'
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/documents', documentRoutes_1.default);
app.use('/api/policies', policyRoutes_1.default);
app.use('/api/qa', qaRoutes_1.default);
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
const PORT = process.env.PORT || 8080;
// Initialize database schema before starting server
(async () => {
    try {
        await (0, schema_1.initializeSchema)();
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    }
    catch (error) {
        console.error('Failed to initialize database schema:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map