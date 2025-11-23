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
  sources: SourceCitation[]; // Kept for backward compatibility, but will be empty
  suggestCoverageCheck?: boolean; // True if the question seems to be about coverage/incidents
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
 * Detect if a question is about coverage/incidents that would benefit from a coverage checklist
 * @param question - User's question
 * @returns True if the question seems coverage/incident-related
 */
function detectCoverageQuestion(question: string): boolean {
  const normalizedQuestion = question.toLowerCase().trim();

  // Keywords that suggest coverage/incident questions
  const coverageKeywords = [
    // Incident-related
    'incident',
    'accident',
    'happened',
    'occurred',
    'broke',
    'broken',
    'injured',
    'injury',
    'hurt',
    'sick',
    'illness',
    'surgery',
    'operation',
    'procedure',
    'treatment',
    'emergency',
    'vet visit',
    'veterinary',
    'diagnosis',
    'diagnosed',
    
    // Coverage-related
    'covered',
    'coverage',
    'cover',
    'is covered',
    'will cover',
    'does it cover',
    'covered by',
    'claim',
    'file a claim',
    'submit claim',
    'claimable',
    
    // Specific conditions/treatments
    'pre-existing',
    'preexisting',
    'waiting period',
    'deductible',
    'reimbursement',
    'reimburse',
    
    // Action-oriented
    'what do i need',
    'what documents',
    'required documents',
    'what steps',
    'how to file',
    'how do i',
    'can i claim',
    'eligible',
    'qualify',
  ];

  // Check if question contains coverage-related keywords
  const hasCoverageKeyword = coverageKeywords.some((keyword) =>
    normalizedQuestion.includes(keyword)
  );

  // Also check for question patterns that suggest coverage inquiries
  const coverageQuestionPatterns = [
    /is.*covered/,
    /will.*cover/,
    /does.*cover/,
    /can.*claim/,
    /what.*need.*claim/,
    /how.*file.*claim/,
    /what.*documents.*need/,
    /is.*eligible/,
  ];

  const matchesPattern = coverageQuestionPatterns.some((pattern) =>
    pattern.test(normalizedQuestion)
  );

  return hasCoverageKeyword || matchesPattern;
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

    // Step 2: Build context from retrieved chunks (for LLM)
    // Include page numbers so LLM can reference them
    const context = relevantChunks
      .map((chunk, index) => {
        const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
        return `[Source ${index + 1}${pageInfo}]:\n${chunk.text}`;
      })
      .join('\n\n---\n\n');

    // Step 3: Build system prompt with instructions to include page references
    const systemPrompt = `You are a helpful assistant that answers questions about pet insurance policies. 
Your answers should be:
- Accurate and based only on the provided policy context
- Clear and easy to understand
- Include specific details like dollar amounts, percentages, and time periods when available

IMPORTANT: At the end of your answer, add a brief note suggesting which page(s) the user should refer to for more details. 
For example: "For more details, refer to page X of your policy document" or "This information can be found on page X."
Use the page numbers from the sources provided in the context. If multiple pages are relevant, mention the most important one or two.

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

    // Step 5: Detect if this question would benefit from a coverage checklist
    const suggestCoverageCheck = detectCoverageQuestion(question);

    // Step 6: Return answer without text citations (LLM includes page references in answer)
    return {
      answer,
      sources: [], // No longer returning text citations
      suggestCoverageCheck,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

