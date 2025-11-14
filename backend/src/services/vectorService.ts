import { getCollection } from '../db/chromaClient';
import { generateEmbeddings } from './embeddingService';
import { generateOrGetEmbedding } from './embeddingCache';
import { TextChunk, extractTextFromChunks } from './chunkingService';

export interface SimilarChunk {
  text: string;
  chunkIndex: number;
  pageNumber?: number;
  documentId?: string;
  policyId?: string;
  distance: number; // Similarity distance (lower = more similar)
}

/**
 * Store document chunks with embeddings in Chroma vector database
 * @param chunks - Array of text chunks with metadata
 * @param documentId - Document ID (must be provided for tracking)
 * @param policyId - Optional policy ID for grouping multiple documents
 */
export async function storeChunks(chunks: TextChunk[], documentId: string, policyId?: string): Promise<void> {
  if (!documentId) {
    throw new Error('Document ID is required to store chunks');
  }

  try {
    // Get Chroma collection
    const collection = await getCollection();

    // Extract text content from chunks for embedding
    const chunkTexts = extractTextFromChunks(chunks);

    // Generate embeddings for all chunks (batch processing)
    const embeddings = await generateEmbeddings(chunkTexts);

    // Prepare data for Chroma
    const ids: string[] = [];
    const metadatas: Array<Record<string, string | number | null>> = [];

    chunks.forEach((chunk, index) => {
      // Create unique ID: documentId_chunkIndex
      ids.push(`${documentId}_${chunk.chunkIndex}`);
      
      // Prepare metadata (Chroma requires string/numbers/null for metadata)
      const metadata: Record<string, string | number | null> = {
        documentId: documentId,
        chunkIndex: chunk.chunkIndex,
      };
      
      if (policyId) {
        metadata.policyId = policyId;
      }

      if (chunk.metadata.pageNumber !== undefined) {
        metadata.pageNumber = chunk.metadata.pageNumber;
      } else {
        metadata.pageNumber = null;
      }
      
      metadatas.push(metadata);
    });

    // Add to Chroma collection
    await collection.add({
      ids: ids,
      embeddings: embeddings,
      documents: chunkTexts,
      metadatas: metadatas,
    });

    console.log(`Stored ${chunks.length} chunks for document ${documentId}`);
  } catch (error) {
    throw new Error(`Failed to store chunks in vector database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Query for similar chunks using a search query
 * @param queryText - Search query text
 * @param nResults - Number of similar chunks to return (default 5)
 * @param filterDocumentId - Optional: filter results to a specific document
 * @returns Array of similar chunks sorted by similarity
 */
export async function querySimilarChunks(
  queryText: string,
  nResults: number = 5,
  filterDocumentId?: string,
  filterPolicyId?: string
): Promise<SimilarChunk[]> {
  try {
    // Get Chroma collection
    const collection = await getCollection();

    // Generate embedding for the query (with caching)
    const queryEmbedding = await generateOrGetEmbedding(queryText);

    // Prepare query with optional filter
    const queryParams: {
      queryEmbeddings: number[][];
      nResults: number;
      where?: Record<string, string>;
    } = {
      queryEmbeddings: [queryEmbedding],
      nResults: nResults,
    };

    if (filterDocumentId || filterPolicyId) {
      queryParams.where = {};
      if (filterDocumentId) {
        queryParams.where.documentId = filterDocumentId;
      }
      if (filterPolicyId) {
        queryParams.where.policyId = filterPolicyId;
      }
    }

    // Query Chroma for similar chunks
    const results = await collection.query(queryParams);

    // Transform results to SimilarChunk format
    const similarChunks: SimilarChunk[] = [];

    if (results.ids && results.ids[0] && results.documents && results.documents[0]) {
      const ids = results.ids[0];
      const documents = results.documents[0];
      const metadatas = results.metadatas?.[0] || [];
      const distances = results.distances?.[0] || [];

      for (let i = 0; i < ids.length; i++) {
        const metadata = metadatas[i] || {};
        const pageNumber = metadata.pageNumber;
        const documentIdValue = metadata.documentId;
        const policyIdValue = metadata.policyId;
        
        const chunk: SimilarChunk = {
          text: documents[i] || '',
          chunkIndex: (metadata.chunkIndex as number) || 0,
          distance: distances[i] || 0,
        };
        
        if (pageNumber !== null && pageNumber !== undefined) {
          chunk.pageNumber = pageNumber as number;
        }
        
        if (documentIdValue) {
          chunk.documentId = documentIdValue as string;
        }

        if (policyIdValue) {
          chunk.policyId = policyIdValue as string;
        }

        similarChunks.push(chunk);
      }
    }

    return similarChunks;
  } catch (error) {
    throw new Error(`Failed to query similar chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete all chunks for a specific document
 * @param documentId - Document ID whose chunks should be deleted
 */
export async function deleteChunksByDocumentId(documentId: string): Promise<number> {
  try {
    const collection = await getCollection();

    // Query to find all chunk IDs for this document
    const results = await collection.get({
      where: { documentId: documentId },
    });

    if (results.ids && results.ids.length > 0) {
      // Delete all chunks for this document
      await collection.delete({ ids: results.ids });
      console.log(`Deleted ${results.ids.length} chunks for document ${documentId}`);
      return results.ids.length;
    }
    
    return 0;
  } catch (error) {
    throw new Error(`Failed to delete chunks for document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete all chunks for a specific policy (all documents in the policy)
 * @param policyId - Policy ID whose chunks should be deleted
 * @returns Number of chunks deleted
 */
export async function deleteChunksByPolicyId(policyId: string): Promise<number> {
  try {
    const collection = await getCollection();

    // Query to find all chunk IDs for this policy
    const results = await collection.get({
      where: { policyId: policyId },
    });

    if (results.ids && results.ids.length > 0) {
      // Delete all chunks for this policy
      await collection.delete({ ids: results.ids });
      console.log(`Deleted ${results.ids.length} chunks for policy ${policyId}`);
      return results.ids.length;
    }
    
    return 0;
  } catch (error) {
    throw new Error(`Failed to delete chunks for policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

