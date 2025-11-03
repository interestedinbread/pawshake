import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface TextChunk {
  text: string;
  chunkIndex: number;
  metadata: {
    pageNumber?: number;
    documentId?: string;
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
export async function chunkDocument(
  text: string,
  pageCount: number,
  documentId?: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): Promise<TextChunk[]> {
  // Initialize LangChain text splitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
  });

  // Split text into chunks
  const chunks = await textSplitter.splitText(text);

  // Estimate page numbers for chunks (simple approximation)
  const chunksPerPage = Math.max(1, Math.floor(chunks.length / pageCount));

  // Create chunks with metadata
  const chunksWithMetadata: TextChunk[] = chunks.map((chunk: string, index: number) => {
    // Estimate which page this chunk came from
    const estimatedPage = Math.min(
      Math.floor(index / chunksPerPage) + 1,
      pageCount
    );

    const metadata: TextChunk['metadata'] = {
      pageNumber: estimatedPage,
    };
    
    if (documentId) {
      metadata.documentId = documentId;
    }

    return {
      text: chunk,
      chunkIndex: index,
      metadata,
    };
  });

  return chunksWithMetadata;
}

/**
 * Get just the text content from chunks (for embedding)
 */
export function extractTextFromChunks(chunks: TextChunk[]): string[] {
  return chunks.map(chunk => chunk.text);
}

