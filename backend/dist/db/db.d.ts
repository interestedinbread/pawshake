import { Pool } from 'pg';
export declare const db: {
    query: (text: string, params?: unknown[]) => Promise<import("pg").QueryResult<any>>;
    pool: Pool;
};
//# sourceMappingURL=db.d.ts.map