"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
exports.generateEmbeddings = generateEmbeddings;
exports.getEmbeddingsInstance = getEmbeddingsInstance;
const openai_1 = require("@langchain/openai");
const env_1 = require("../config/env");
// Initialize OpenAI embeddings model
const embeddings = new openai_1.OpenAIEmbeddings({
    openAIApiKey: env_1.env.openAIApiKey,
    modelName: 'text-embedding-3-small', // or 'text-embedding-3-large' for better quality
});
/**
 * Generate embeddings for a single text chunk
 */
async function generateEmbedding(text) {
    try {
        const embedding = await embeddings.embedQuery(text);
        return embedding;
    }
    catch (error) {
        throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Generate embeddings for multiple text chunks (batch processing)
 * More efficient than calling generateEmbedding multiple times
 */
async function generateEmbeddings(texts) {
    try {
        const embeddingVectors = await embeddings.embedDocuments(texts);
        return embeddingVectors;
    }
    catch (error) {
        throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Get the embeddings instance (useful for LangChain integrations)
 */
function getEmbeddingsInstance() {
    return embeddings;
}
//# sourceMappingURL=embeddingService.js.map