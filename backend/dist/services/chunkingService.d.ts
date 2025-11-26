export interface TextChunk {
    text: string;
    chunkIndex: number;
    metadata: {
        pageNumber?: number;
        documentId?: string;
        policyId?: string;
    };
}
/**
 * Split document text into chunks with metadata
 * @param text - Full document text
 * @param pageCount - Number of pages in the document
 * @param documentId - Optional document ID for tracking
 * @param chunkSize - Size of each chunk in characters (default 1000)
 * @param chunkOverlap - Overlap between chunks in characters (default 200)
 */
export declare function chunkDocument(text: string, pageCount: number, documentId?: string, policyId?: string, chunkSize?: number, chunkOverlap?: number): Promise<TextChunk[]>;
/**
 * Get just the text content from chunks (for embedding)
 */
export declare function extractTextFromChunks(chunks: TextChunk[]): string[];
//# sourceMappingURL=chunkingService.d.ts.map