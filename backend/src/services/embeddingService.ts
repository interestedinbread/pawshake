import { OpenAIEmbeddings } from '@langchain/openai';

// Initialize OpenAI embeddings model
const openAIApiKey = process.env.OPENAI_API_KEY;
if (!openAIApiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openAIApiKey,
  modelName: 'text-embedding-3-small', // or 'text-embedding-3-large' for better quality
});

/**
 * Generate embeddings for a single text chunk
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple text chunks (batch processing)
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const embeddingVectors = await embeddings.embedDocuments(texts);
    return embeddingVectors;
  } catch (error) {
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the embeddings instance (useful for LangChain integrations)
 */
export function getEmbeddingsInstance() {
  return embeddings;
}

