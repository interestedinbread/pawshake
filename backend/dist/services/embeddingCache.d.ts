/**
 * Cache statistics for monitoring
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
}
/**
 * Generate or retrieve embedding from cache
 * This function should be used for query embeddings (user questions)
 * to reduce OpenAI API calls for repeated or similar questions.
 *
 * @param question - User's question text
 * @returns Embedding vector for the question
 */
export declare function generateOrGetEmbedding(question: string): Promise<number[]>;
/**
 * Get cache statistics
 * Useful for monitoring cache performance
 */
export declare function getCacheStats(): CacheStats;
/**
 * Clear the embedding cache
 * Useful for testing or memory management
 */
export declare function clearCache(): void;
/**
 * Get cache size
 */
export declare function getCacheSize(): number;
export {};
//# sourceMappingURL=embeddingCache.d.ts.map