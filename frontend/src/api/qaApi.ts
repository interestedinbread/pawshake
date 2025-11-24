import { apiClient } from './apiClient';

export interface SourceCitation {
  text: string;
  pageNumber?: number;
  documentId?: string;
  policyId?: string;
  chunkIndex: number;
  similarity: number; // Lower distance = higher similarity
}

export interface QAResponse {
  answer: string;
  sources: SourceCitation[];
  suggestCoverageCheck?: boolean; // True if the question seems to be about incidents/claims
}

interface AskQuestionRequest {
  question: string;
  policyId: string;
}

/**
 * Ask a question about a policy
 * @param question - The user's question
 * @param policyId - The policy ID to scope the question to
 * @returns The answer with source citations
 */
async function askQuestion(
  question: string,
  policyId: string
): Promise<QAResponse> {
  const requestBody: AskQuestionRequest = {
    question: question.trim(),
    policyId,
  };

  return apiClient.post<QAResponse>('/qa/ask', requestBody);
}

export const qaApi = {
  askQuestion,
};

