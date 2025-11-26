"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkDocument = chunkDocument;
exports.extractTextFromChunks = extractTextFromChunks;
const textsplitters_1 = require("@langchain/textsplitters");
/**
 * Split document text into chunks with metadata
 * @param text - Full document text
 * @param pageCount - Number of pages in the document
 * @param documentId - Optional document ID for tracking
 * @param chunkSize - Size of each chunk in characters (default 1000)
 * @param chunkOverlap - Overlap between chunks in characters (default 200)
 */
async function chunkDocument(text, pageCount, documentId, policyId, chunkSize = 1000, chunkOverlap = 200) {
    // Initialize LangChain text splitter
    const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
        chunkSize: chunkSize,
        chunkOverlap: chunkOverlap,
    });
    // Split text into chunks
    const chunks = await textSplitter.splitText(text);
    // Estimate page numbers for chunks (simple approximation)
    const chunksPerPage = Math.max(1, Math.floor(chunks.length / pageCount));
    // Create chunks with metadata
    const chunksWithMetadata = chunks.map((chunk, index) => {
        // Estimate which page this chunk came from
        const estimatedPage = Math.min(Math.floor(index / chunksPerPage) + 1, pageCount);
        const metadata = {
            pageNumber: estimatedPage,
        };
        if (documentId) {
            metadata.documentId = documentId;
        }
        if (policyId) {
            metadata.policyId = policyId;
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
function extractTextFromChunks(chunks) {
    return chunks.map(chunk => chunk.text);
}
//# sourceMappingURL=chunkingService.js.map