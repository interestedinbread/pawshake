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
    similarity: number;
}
/**
 * Generate an answer to a user's question using RAG (Retrieval-Augmented Generation)
 * @param question - User's question about their policy
 * @param documentId - Optional: filter to a specific document
 * @param policyId - Optional: filter to a specific policy bundle
 * @param nResults - Number of similar chunks to retrieve (default 5)
 * @returns Answer with source citations
 */
export declare function answerQuestion(question: string, documentId?: string, policyId?: string, nResults?: number): Promise<QAResponse>;
//# sourceMappingURL=qaService.d.ts.map