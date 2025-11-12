import { ChatOpenAI } from '@langchain/openai';
import { querySimilarChunks, SimilarChunk } from './vectorService';

// Initialize OpenAI chat model
const openAIApiKey = process.env.OPENAI_API_KEY;
if (!openAIApiKey) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

const chatModel = new ChatOpenAI({
  openAIApiKey: openAIApiKey,
  modelName: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can upgrade to gpt-4o if needed
  temperature: 0.3, // Lower temperature for more factual, consistent answers
});

export interface QAResponse {
  answer: string;
  sources: SourceCitation[];
}

export interface SourceCitation {
  text: string;
  pageNumber?: number;
  documentId?: string;
  policyId?: string;
  chunkIndex: number;
  similarity: number; // Lower distance = higher similarity
}

/**
 * Generate an answer to a user's question using RAG (Retrieval-Augmented Generation)
 * @param question - User's question about their policy
 * @param documentId - Optional: filter to a specific document
 * @param policyId - Optional: filter to a specific policy bundle
 * @param nResults - Number of similar chunks to retrieve (default 5)
 * @returns Answer with source citations
 */
export async function answerQuestion(
  question: string,
  documentId?: string,
  policyId?: string,
  nResults: number = 5
): Promise<QAResponse> {
  try {
    // Validate input
    if (!question || question.trim().length === 0) {
      throw new Error('Question is required');
    }

    // Step 1: Retrieve relevant chunks from vector database
    const relevantChunks = await querySimilarChunks(question, nResults, documentId, policyId);

    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find any relevant information in your policy documents to answer this question. Please make sure you have uploaded your policy document and try rephrasing your question.",
        sources: [],
      };
    }

    // Step 2: Build context from retrieved chunks
    const context = relevantChunks
      .map((chunk, index) => {
        const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
        return `[Source ${index + 1}${pageInfo}]:\n${chunk.text}`;
      })
      .join('\n\n---\n\n');

    // Step 3: Build system prompt with instructions for citing sources
    const systemPrompt = `You are a helpful assistant that answers questions about pet insurance policies. 
Your answers should be:
- Accurate and based only on the provided policy context
- Clear and easy to understand
- Include specific details like dollar amounts, percentages, and time periods when available
- Cite which source(s) you used by referencing "Source 1", "Source 2", etc.

If the provided context doesn't contain enough information to fully answer the question, say so honestly.
Do not make up information that isn't in the provided context.

Policy Context:
${context}`;

    // Step 4: Generate answer using ChatOpenAI
    const response = await chatModel.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ]);

    const answer = response.content as string;

    // Step 5: Format source citations
    const sources: SourceCitation[] = relevantChunks.map((chunk) => {
      const citation: SourceCitation = {
        text: chunk.text,
        chunkIndex: chunk.chunkIndex,
        similarity: chunk.distance, // Lower distance = higher similarity
      };
      
      // Only include optional properties if they exist
      if (chunk.pageNumber !== undefined) {
        citation.pageNumber = chunk.pageNumber;
      }
      
      if (chunk.documentId) {
        citation.documentId = chunk.documentId;
      }

      if (chunk.policyId) {
        citation.policyId = chunk.policyId;
      }
      
      return citation;
    });

    return {
      answer,
      sources,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

