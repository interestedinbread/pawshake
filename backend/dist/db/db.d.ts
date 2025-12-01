import { Pool } from 'pg';
export declare const db: {
    query: (text: string, params?: unknown[]) => Promise<import("pg").QueryResult<any>>;
    pool: Pool;
};
/**
 * Test database connection on startup
 * Throws an error if the connection fails
 */
export declare function testDatabaseConnection(): Promise<void>;
//# sourceMappingURL=db.d.ts.map