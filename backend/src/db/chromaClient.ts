import { ChromaClient } from 'chromadb';
import { env } from '../config/env';

// Create Chroma client
// For ChromaDB v3+, you need a running Chroma server
// Option 1: Run Docker: docker run -d -p 8000:8000 --name chroma chromadb/chroma
// Option 2: Run Chroma server locally via Python
// The Chroma URL is configured via CHROMA_URL environment variable (defaults to http://localhost:8000)
const client = new ChromaClient({
  path: env.chromaUrl
});

// Collection name for document embeddings
const COLLECTION_NAME = 'document_embeddings';

/**
 * Get or create the embeddings collection
 */
export async function getCollection() {
  try {
    // Try to get existing collection
    const collection = await client.getCollection({ name: COLLECTION_NAME });
    return collection;
  } catch (error) {
    // Collection doesn't exist, create it
    const collection = await client.createCollection({
      name: COLLECTION_NAME,
      metadata: { description: 'Document embeddings for RAG' },
    });
    return collection;
  }
}

/**
 * Get the Chroma client instance
 */
export function getChromaClient() {
  return client;
}

