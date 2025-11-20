"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrGetEmbedding = generateOrGetEmbedding;
exports.getCacheStats = getCacheStats;
exports.clearCache = clearCache;
exports.getCacheSize = getCacheSize;
const embeddingService_1 = require("./embeddingService");
/**
 * In-memory cache for query embeddings
 * Key: normalized question text
 * Value: embedding vector
 */
const embeddingCache = new Map();
let cacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
};
/**
 * Normalize question text for consistent caching
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove extra spaces
 */
function normalizeQuestion(question) {
    return question
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}
/**
 * Generate or retrieve embedding from cache
 * This function should be used for query embeddings (user questions)
 * to reduce OpenAI API calls for repeated or similar questions.
 *
 * @param question - User's question text
 * @returns Embedding vector for the question
 */
async function generateOrGetEmbedding(question) {
    // Normalize the question for consistent caching
    const normalizedQuestion = normalizeQuestion(question);
    // Check cache first
    if (embeddingCache.has(normalizedQuestion)) {
        cacheStats.hits++;
        const cachedEmbedding = embeddingCache.get(normalizedQuestion);
        if (cachedEmbedding) {
            return cachedEmbedding;
        }
    }
    // Cache miss - generate new embedding
    cacheStats.misses++;
    const embedding = await (0, embeddingService_1.generateEmbedding)(question);
    // Store in cache
    embeddingCache.set(normalizedQuestion, embedding);
    cacheStats.size = embeddingCache.size;
    return embedding;
}
/**
 * Get cache statistics
 * Useful for monitoring cache performance
 */
function getCacheStats() {
    return {
        ...cacheStats,
        size: embeddingCache.size,
    };
}
/**
 * Clear the embedding cache
 * Useful for testing or memory management
 */
function clearCache() {
    embeddingCache.clear();
    cacheStats = {
        hits: 0,
        misses: 0,
        size: 0,
    };
}
/**
 * Get cache size
 */
function getCacheSize() {
    return embeddingCache.size;
}
//# sourceMappingURL=embeddingCache.js.map