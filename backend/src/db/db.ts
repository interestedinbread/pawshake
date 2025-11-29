import { Pool } from 'pg';
import { env } from '../config/env';

const pool = new Pool({
    connectionString: env.databaseUrl
})

export const db = {
    query: (text: string, params?: unknown[]) => pool.query(text, params),
    pool,
}