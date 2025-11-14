import { generateEmbedding } from './embeddingService';

/**
 * In-memory cache for query embeddings
 * Key: normalized question text
 * Value: embedding vector
 */
const embeddingCache = new Map<string, number[]>();

/**
 * Cache statistics for monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

let cacheStats: CacheStats = {
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
function normalizeQuestion(question: string): string {
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
export async function generateOrGetEmbedding(question: string): Promise<number[]> {
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
  const embedding = await generateEmbedding(question);
  
  // Store in cache
  embeddingCache.set(normalizedQuestion, embedding);
  cacheStats.size = embeddingCache.size;
  
  return embedding;
}

/**
 * Get cache statistics
 * Useful for monitoring cache performance
 */
export function getCacheStats(): CacheStats {
  return {
    ...cacheStats,
    size: embeddingCache.size,
  };
}

/**
 * Clear the embedding cache
 * Useful for testing or memory management
 */
export function clearCache(): void {
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
export function getCacheSize(): number {
  return embeddingCache.size;
}

