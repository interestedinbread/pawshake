"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.testDatabaseConnection = testDatabaseConnection;
const pg_1 = require("pg");
const env_1 = require("../config/env");
const pool = new pg_1.Pool({
    connectionString: env_1.env.databaseUrl
});
exports.db = {
    query: (text, params) => pool.query(text, params),
    pool,
};
/**
 * Test database connection on startup
 * Throws an error if the connection fails
 */
async function testDatabaseConnection() {
    try {
        // Simple query to test the connection
        await pool.query('SELECT 1');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to connect to database.\n` +
            `Error: ${errorMessage}\n` +
            `Please verify:\n` +
            `  1. DATABASE_URL is correct (format: postgresql://user:password@host:port/database)\n` +
            `  2. Database server is running and accessible\n` +
            `  3. Network connectivity to the database host\n` +
            `  4. Database credentials are correct`);
    }
}
//# sourceMappingURL=db.js.map