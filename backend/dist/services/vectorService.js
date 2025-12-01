"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeChunks = storeChunks;
exports.querySimilarChunks = querySimilarChunks;
exports.deleteChunksByDocumentId = deleteChunksByDocumentId;
exports.deleteChunksByPolicyId = deleteChunksByPolicyId;
const chromaClient_1 = require("../db/chromaClient");
const embeddingService_1 = require("./embeddingService");
const embeddingCache_1 = require("./embeddingCache");
const chunkingService_1 = require("./chunkingService");
/**
 * Store document chunks with embeddings in Chroma vector database
 * @param chunks - Array of text chunks with metadata
 * @param documentId - Document ID (must be provided for tracking)
 * @param policyId - Optional policy ID for grouping multiple documents
 */
async function storeChunks(chunks, documentId, policyId) {
    if (!documentId) {
        throw new Error('Document ID is required to store chunks');
    }
    try {
        // Get Chroma collection
        const collection = await (0, chromaClient_1.getCollection)();
        // Extract text content from chunks for embedding
        const chunkTexts = (0, chunkingService_1.extractTextFromChunks)(chunks);
        // Generate embeddings for all chunks (batch processing)
        const embeddings = await (0, embeddingService_1.generateEmbeddings)(chunkTexts);
        // Prepare data for Chroma
        const ids = [];
        const metadatas = [];
        chunks.forEach((chunk, index) => {
            // Create unique ID: documentId_chunkIndex
            ids.push(`${documentId}_${chunk.chunkIndex}`);
            // Prepare metadata (Chroma requires string/numbers/null for metadata)
            const metadata = {
                documentId: documentId,
                chunkIndex: chunk.chunkIndex,
            };
            if (policyId) {
                metadata.policyId = policyId;
            }
            if (chunk.metadata.pageNumber !== undefined) {
                metadata.pageNumber = chunk.metadata.pageNumber;
            }
            else {
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
    }
    catch (error) {
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
async function querySimilarChunks(queryText, nResults = 5, filterDocumentId, filterPolicyId) {
    try {
        // Get Chroma collection
        const collection = await (0, chromaClient_1.getCollection)();
        // Generate embedding for the query (with caching)
        const queryEmbedding = await (0, embeddingCache_1.generateOrGetEmbedding)(queryText);
        // Prepare query with optional filter
        const queryParams = {
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
        const similarChunks = [];
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
                const chunk = {
                    text: documents[i] || '',
                    chunkIndex: metadata.chunkIndex || 0,
                    distance: distances[i] || 0,
                };
                if (pageNumber !== null && pageNumber !== undefined) {
                    chunk.pageNumber = pageNumber;
                }
                if (documentIdValue) {
                    chunk.documentId = documentIdValue;
                }
                if (policyIdValue) {
                    chunk.policyId = policyIdValue;
                }
                similarChunks.push(chunk);
            }
        }
        return similarChunks;
    }
    catch (error) {
        throw new Error(`Failed to query similar chunks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Delete all chunks for a specific document
 * @param documentId - Document ID whose chunks should be deleted
 */
async function deleteChunksByDocumentId(documentId) {
    try {
        const collection = await (0, chromaClient_1.getCollection)();
        // Query to find all chunk IDs for this document
        const results = await collection.get({
            where: { documentId: documentId },
        });
        if (results.ids && results.ids.length > 0) {
            // Delete all chunks for this document
            await collection.delete({ ids: results.ids });
            return results.ids.length;
        }
        return 0;
    }
    catch (error) {
        throw new Error(`Failed to delete chunks for document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Delete all chunks for a specific policy (all documents in the policy)
 * @param policyId - Policy ID whose chunks should be deleted
 * @returns Number of chunks deleted
 */
async function deleteChunksByPolicyId(policyId) {
    try {
        const collection = await (0, chromaClient_1.getCollection)();
        // Query to find all chunk IDs for this policy
        const results = await collection.get({
            where: { policyId: policyId },
        });
        if (results.ids && results.ids.length > 0) {
            // Delete all chunks for this policy
            await collection.delete({ ids: results.ids });
            return results.ids.length;
        }
        return 0;
    }
    catch (error) {
        throw new Error(`Failed to delete chunks for policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=vectorService.js.map