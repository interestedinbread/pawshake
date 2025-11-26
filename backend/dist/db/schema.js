"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsersTable = createUsersTable;
exports.createPoliciesTable = createPoliciesTable;
exports.createDocumentsTable = createDocumentsTable;
exports.createPolicySummariesTable = createPolicySummariesTable;
exports.initializeSchema = initializeSchema;
const db_1 = require("./db");
async function createUsersTable() {
    try {
        await db_1.db.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
        await db_1.db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    `);
        console.log('Users table initialized (already exists or created)');
    }
    catch (error) {
        console.error('Error creating users table:', error);
        throw error;
    }
}
async function createPoliciesTable() {
    try {
        await db_1.db.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS policies_user_id_idx ON policies (user_id);
    `);
        console.log('Policies table initialized (already exists or created)');
    }
    catch (error) {
        console.error('Error creating policies table:', error);
        throw error;
    }
}
async function createDocumentsTable() {
    try {
        await db_1.db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_path TEXT,
        extracted_text TEXT NOT NULL,
        page_count INTEGER NOT NULL,
        document_type TEXT DEFAULT 'policy',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
        await db_1.db.query(`
      ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS policy_id UUID REFERENCES policies(id) ON DELETE CASCADE;
    `);
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents (user_id);
    `);
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS documents_policy_id_idx ON documents (policy_id);
    `);
        console.log('Documents table initialized (already exists or created)');
    }
    catch (error) {
        console.error('Error creating documents table:', error);
        throw error;
    }
}
async function createPolicySummariesTable() {
    try {
        await db_1.db.query(`
      CREATE TABLE IF NOT EXISTS policy_summaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        policy_id UUID UNIQUE REFERENCES policies(id) ON DELETE CASCADE,
        document_id UUID UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
        summary_data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
        await db_1.db.query(`
      ALTER TABLE policy_summaries
      ADD COLUMN IF NOT EXISTS policy_id UUID UNIQUE REFERENCES policies(id) ON DELETE CASCADE;
    `);
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS policy_summaries_document_id_idx ON policy_summaries (document_id);
    `);
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS policy_summaries_policy_id_idx ON policy_summaries (policy_id);
    `);
        // GIN index on JSONB for efficient querying of nested fields
        await db_1.db.query(`
      CREATE INDEX IF NOT EXISTS policy_summaries_summary_data_idx 
      ON policy_summaries USING GIN (summary_data);
    `);
        console.log('Policy summaries table initialized (already exists or created)');
    }
    catch (error) {
        console.error('Error creating policy summaries table:', error);
        throw error;
    }
}
async function initializeSchema() {
    await createUsersTable();
    await createPoliciesTable();
    await createDocumentsTable();
    await createPolicySummariesTable();
}
//# sourceMappingURL=schema.js.map