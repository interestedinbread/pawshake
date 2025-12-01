"use strict";
/**
 * Centralized environment variable validation and configuration
 *
 * This module validates all required environment variables on startup
 * and exports a typed configuration object. If any required variable
 * is missing, the application will fail to start with a clear error message.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtExpiresIn = exports.chromaUrl = exports.port = exports.corsOrigin = exports.databaseUrl = exports.jwtSecret = exports.openAIApiKey = exports.env = void 0;
/**
 * Validates and returns environment configuration
 * Throws an error if any required variable is missing
 */
function validateEnv() {
    // Required variables - fail fast if missing
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
        throw new Error('Missing required environment variable: OPENAI_API_KEY\n' +
            'Please set OPENAI_API_KEY in your .env file or environment.');
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('Missing required environment variable: JWT_SECRET\n' +
            'Please set JWT_SECRET in your .env file or environment.\n' +
            'Generate a secure random string (e.g., using: openssl rand -base64 32)');
    }
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('Missing required environment variable: DATABASE_URL\n' +
            'Please set DATABASE_URL in your .env file or environment.\n' +
            'Format: postgresql://user:password@host:port/database');
    }
    // Optional variables with defaults
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    const port = parseInt(process.env.PORT || '8080', 10);
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    // Validate port is a valid number
    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT value: ${process.env.PORT}\n` +
            'PORT must be a number between 1 and 65535.');
    }
    // Security: Prevent wildcard CORS in production
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'production' && corsOrigin === '*') {
        throw new Error('Security error: CORS_ORIGIN cannot be "*" in production environment.\n' +
            'Please set CORS_ORIGIN to your frontend domain (e.g., https://yourdomain.com).\n' +
            'This prevents unauthorized websites from accessing your API.');
    }
    return {
        openAIApiKey,
        jwtSecret,
        databaseUrl,
        corsOrigin,
        port,
        chromaUrl,
        jwtExpiresIn,
    };
}
// Validate and export configuration
// This will throw an error immediately if any required variable is missing
exports.env = validateEnv();
// Export individual values for convenience
exports.openAIApiKey = exports.env.openAIApiKey, exports.jwtSecret = exports.env.jwtSecret, exports.databaseUrl = exports.env.databaseUrl, exports.corsOrigin = exports.env.corsOrigin, exports.port = exports.env.port, exports.chromaUrl = exports.env.chromaUrl, exports.jwtExpiresIn = exports.env.jwtExpiresIn;
//# sourceMappingURL=env.js.map