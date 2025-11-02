import { ChromaClient } from 'chromadb';

// Create Chroma client with local persistent storage
const client = new ChromaClient({
  path: './chroma_db', // Local storage directory (created automatically)
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

