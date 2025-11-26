"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollection = getCollection;
exports.getChromaClient = getChromaClient;
const chromadb_1 = require("chromadb");
// Create Chroma client
// For ChromaDB v3+, you need a running Chroma server
// Option 1: Run Docker: docker run -d -p 8000:8000 --name chroma chromadb/chroma
// Option 2: Run Chroma server locally via Python
// For now, we'll try to connect to localhost:8000 (default)
const client = new chromadb_1.ChromaClient({
    path: 'http://localhost:8000'
});
// Collection name for document embeddings
const COLLECTION_NAME = 'document_embeddings';
/**
 * Get or create the embeddings collection
 */
async function getCollection() {
    try {
        // Try to get existing collection
        const collection = await client.getCollection({ name: COLLECTION_NAME });
        return collection;
    }
    catch (error) {
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
function getChromaClient() {
    return client;
}
//# sourceMappingURL=chromaClient.js.map