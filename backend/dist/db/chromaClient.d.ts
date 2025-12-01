import { ChromaClient } from 'chromadb';
/**
 * Test ChromaDB connection on startup
 * Throws an error if the connection fails
 */
export declare function testChromaConnection(): Promise<void>;
/**
 * Get or create the embeddings collection
 */
export declare function getCollection(): Promise<import("chromadb").Collection>;
/**
 * Get the Chroma client instance
 */
export declare function getChromaClient(): ChromaClient;
//# sourceMappingURL=chromaClient.d.ts.map