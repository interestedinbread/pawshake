import { TextChunk } from './chunkingService';
export interface SimilarChunk {
    text: string;
    chunkIndex: number;
    pageNumber?: number;
    documentId?: string;
    policyId?: string;
    distance: number;
}
/**
 * Store document chunks with embeddings in Chroma vector database
 * @param chunks - Array of text chunks with metadata
 * @param documentId - Document ID (must be provided for tracking)
 * @param policyId - Optional policy ID for grouping multiple documents
 */
export declare function storeChunks(chunks: TextChunk[], documentId: string, policyId?: string): Promise<void>;
/**
 * Query for similar chunks using a search query
 * @param queryText - Search query text
 * @param nResults - Number of similar chunks to return (default 5)
 * @param filterDocumentId - Optional: filter results to a specific document
 * @returns Array of similar chunks sorted by similarity
 */
export declare function querySimilarChunks(queryText: string, nResults?: number, filterDocumentId?: string, filterPolicyId?: string): Promise<SimilarChunk[]>;
/**
 * Delete all chunks for a specific document
 * @param documentId - Document ID whose chunks should be deleted
 */
export declare function deleteChunksByDocumentId(documentId: string): Promise<number>;
/**
 * Delete all chunks for a specific policy (all documents in the policy)
 * @param policyId - Policy ID whose chunks should be deleted
 * @returns Number of chunks deleted
 */
export declare function deleteChunksByPolicyId(policyId: string): Promise<number>;
//# sourceMappingURL=vectorService.d.ts.map