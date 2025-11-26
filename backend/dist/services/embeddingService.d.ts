import { OpenAIEmbeddings } from '@langchain/openai';
/**
 * Generate embeddings for a single text chunk
 */
export declare function generateEmbedding(text: string): Promise<number[]>;
/**
 * Generate embeddings for multiple text chunks (batch processing)
 * More efficient than calling generateEmbedding multiple times
 */
export declare function generateEmbeddings(texts: string[]): Promise<number[][]>;
/**
 * Get the embeddings instance (useful for LangChain integrations)
 */
export declare function getEmbeddingsInstance(): OpenAIEmbeddings<number[]>;
//# sourceMappingURL=embeddingService.d.ts.map