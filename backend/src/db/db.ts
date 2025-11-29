import { Pool } from 'pg';
import { env } from '../config/env';

const pool = new Pool({
    connectionString: env.databaseUrl
})

export const db = {
    query: (text: string, params?: unknown[]) => pool.query(text, params),
    pool,
}

/**
 * Test database connection on startup
 * Throws an error if the connection fails
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    // Simple query to test the connection
    await pool.query('SELECT 1');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to connect to database.\n` +
      `Error: ${errorMessage}\n` +
      `Please verify:\n` +
      `  1. DATABASE_URL is correct (format: postgresql://user:password@host:port/database)\n` +
      `  2. Database server is running and accessible\n` +
      `  3. Network connectivity to the database host\n` +
      `  4. Database credentials are correct`
    );
  }
}