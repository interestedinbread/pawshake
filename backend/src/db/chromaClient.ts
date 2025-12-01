import { ChromaClient } from 'chromadb';
import { env } from '../config/env';
import logger from '../utils/logger';

// Helper function to parse ChromaDB URL and create client
function createChromaClient(url: string): ChromaClient {
  try {
    // Ensure URL has protocol
    let chromaUrl = url.trim();
    if (!chromaUrl.startsWith('http://') && !chromaUrl.startsWith('https://')) {
      // Default to https for production, http for localhost
      chromaUrl = chromaUrl.includes('localhost') || chromaUrl.includes('127.0.0.1')
        ? `http://${chromaUrl}`
        : `https://${chromaUrl}`;
    }

    // Parse the URL
    const urlObj = new URL(chromaUrl);
    const host = urlObj.hostname;
    const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === 'https:' ? 443 : 8000);
    const ssl = urlObj.protocol === 'https:';

    // Use the new API format (host, port, ssl) instead of deprecated 'path'
    return new ChromaClient({
      host,
      port,
      ssl,
    });
  } catch (error) {
    throw new Error(
      `Invalid CHROMA_URL format: ${url}\n` +
      `Expected format: http://host:port or https://host:port\n` +
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Create Chroma client
// For ChromaDB v3+, you need a running Chroma server
// Option 1: Run Docker: docker run -d -p 8000:8000 --name chroma chromadb/chroma
// Option 2: Run Chroma server locally via Python
// The Chroma URL is configured via CHROMA_URL environment variable (defaults to http://localhost:8000)
const client = createChromaClient(env.chromaUrl);

// Collection name for document embeddings
const COLLECTION_NAME = 'document_embeddings';

/**
 * Test ChromaDB connection on startup
 * Throws an error if the connection fails
 */
export async function testChromaConnection(): Promise<void> {
  try {
    // Try to list collections as a simple health check
    // This will fail if ChromaDB server is not accessible
    await client.listCollections();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to connect to ChromaDB at ${env.chromaUrl}.\n` +
      `Error: ${errorMessage}\n` +
      `Please verify:\n` +
      `  1. CHROMA_URL is correct and includes protocol (http:// or https://)\n` +
      `  2. Format: https://your-chroma-service.railway.app (or http://localhost:8000 for local)\n` +
      `  3. ChromaDB server is running and accessible\n` +
      `  4. Network connectivity to the ChromaDB host\n` +
      `  5. If using Railway, ensure TCP proxy is set up on port 8000`
    );
  }
}

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

