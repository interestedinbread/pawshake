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
const env_1 = require("./config/env");
const db_1 = require("./db/db");
const chromaClient_1 = require("./db/chromaClient");
const schema_1 = require("./db/schema");
const logger_1 = __importDefault(require("./utils/logger"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const policyRoutes_1 = __importDefault(require("./routes/policyRoutes"));
const qaRoutes_1 = __importDefault(require("./routes/qaRoutes"));
const app = (0, express_1.default)();
const ALLOWED_ORIGIN = env_1.env.corsOrigin;
app.use((0, cors_1.default)({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
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
// Global error handler with structured logging
app.use((err, req, res, _next) => {
    // Extract error information
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const errorStack = err instanceof Error ? err.stack : undefined;
    // Build request context for logging
    const requestContext = {
        method: req.method,
        path: req.path,
        url: req.url,
        userId: req.userId,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
        // Only include body for non-sensitive endpoints (exclude auth)
        ...(req.path?.startsWith('/api/auth') ? {} : {
            body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined
        }),
    };
    // Log the error with full context
    logger_1.default.error('Unhandled error in request', {
        error: errorMessage,
        stack: errorStack,
        ...requestContext,
    });
    // Send generic error response (don't leak internal details)
    res.status(500).json({ error: 'Internal server error' });
});
// Initialize database connection and schema before starting server
(async () => {
    try {
        // Test database connection first
        logger_1.default.info('Testing database connection...');
        await (0, db_1.testDatabaseConnection)();
        logger_1.default.info('Database connection successful');
        // Test ChromaDB connection
        logger_1.default.info('Testing ChromaDB connection...');
        await (0, chromaClient_1.testChromaConnection)();
        logger_1.default.info('ChromaDB connection successful');
        // Initialize database schema
        logger_1.default.info('Initializing database schema...');
        await (0, schema_1.initializeSchema)();
        logger_1.default.info('Database schema initialized');
        // Start the server
        app.listen(env_1.env.port, () => {
            logger_1.default.info('Server started successfully', {
                port: env_1.env.port,
                environment: process.env.NODE_ENV || 'development',
            });
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map