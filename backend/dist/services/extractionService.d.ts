import { PolicySummary } from '../types/policySummary';
/**
 * Extract structured policy information from document text using LLM
 * @param documentText - Full text content of the policy document
 * @param documentId - Document ID for RAG verification and source citations
 * @param pageCount - Number of pages (for source tracking)
 * @returns Structured policy summary with confidence levels and sources
 */
export declare function extractPolicySummary(documentText: string, documentId: string, policyId: string, pageCount: number): Promise<PolicySummary>;
//# sourceMappingURL=extractionService.d.ts.map