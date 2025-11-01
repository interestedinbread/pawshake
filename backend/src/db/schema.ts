import { db } from './db';

export async function createUsersTable(): Promise<void> {
  try {
    
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    
    await db.query(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    `);

    console.log('Users table initialized (already exists or created)');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw error;
  }
}

export async function createDocumentsTable(): Promise<void> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_path TEXT,
        extracted_text TEXT NOT NULL,
        page_count INTEGER NOT NULL,
        document_type TEXT DEFAULT 'policy',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
    `);

    console.log('Documents table initialized (already exists or created)');
  } catch (error) {
    console.error('Error creating documents table:', error);
    throw error;
  }
}

export async function initializeSchema(): Promise<void> {
  await createUsersTable();
  await createDocumentsTable();
}

