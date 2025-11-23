import { SimilarChunk } from './vectorService';
import { PolicySummary } from '../types/policySummary';
/**
 * Key topics to compare between policies
 * These will be used as query strings for vector search
 */
declare const COMPARISON_TOPICS: readonly ["deductible", "reimbursement rate", "coverage types", "waiting period", "exclusions", "annual maximum"];
export type ComparisonTopic = typeof COMPARISON_TOPICS[number];
/**
 * Context retrieved for a specific topic from a policy
 */
export interface PolicyTopicContext {
    policyId: string;
    topic: string;
    chunks: SimilarChunk[];
}
/**
 * Comparison context for both policies on a specific topic
 */
export interface TopicComparisonContext {
    topic: string;
    policy1Chunks: SimilarChunk[];
    policy2Chunks: SimilarChunk[];
}
/**
 * Result of LLM language comparison for a specific topic
 */
export interface LanguageComparisonResult {
    topic: string;
    policy1Summary: string;
    policy2Summary: string;
    keyDifferences: Array<{
        aspect: string;
        policy1Approach: string;
        policy2Approach: string;
        analysis: string;
    }>;
    overallComparison: string;
    whichIsBetter: 'policy1' | 'policy2' | 'similar' | 'depends';
    reasoning: string;
    sourceChunks: {
        policy1: Array<{
            text: string;
            pageNumber?: number;
            documentId?: string;
        }>;
        policy2: Array<{
            text: string;
            pageNumber?: number;
            documentId?: string;
        }>;
    };
}
/**
 * Structured comparison of policy summary fields
 */
export interface StructuredComparison {
    deductible: {
        policy1: PolicySummary['deductible'];
        policy2: PolicySummary['deductible'];
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
    reimbursementRate: {
        policy1: number | null;
        policy2: number | null;
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
    annualMaximum: {
        policy1: number | null;
        policy2: number | null;
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
    perIncidentMaximum: {
        policy1: number | null;
        policy2: number | null;
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
    waitingPeriod: {
        policy1: PolicySummary['waitingPeriod'];
        policy2: PolicySummary['waitingPeriod'];
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
    coverageTypes: {
        policy1: string[] | null;
        policy2: string[] | null;
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
    exclusions: {
        policy1: string[] | null;
        policy2: string[] | null;
        comparison: 'policy1_better' | 'policy2_better' | 'same' | 'different';
        analysis?: string;
    };
}
/**
 * Get policy context (chunks) for a specific topic using RAG
 * @param policyId - Policy ID to query
 * @param topic - Topic to search for (e.g., "deductible", "coverage")
 * @param nChunks - Number of chunks to retrieve (default 5-7)
 * @returns Array of relevant chunks for the topic
 */
export declare function getPolicyContextForTopic(policyId: string, topic: string, nChunks?: number): Promise<SimilarChunk[]>;
/**
 * Get comparison context for both policies on all topics
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param topics - Topics to compare (defaults to all)
 * @returns Comparison context grouped by topic
 */
export declare function getComparisonContext(policy1Id: string, policy2Id: string, topics?: readonly string[]): Promise<TopicComparisonContext[]>;
/**
 * Simple comparison response for chat interface
 * Returns a natural language answer, similar to QA responses
 */
export interface ComparisonAnswer {
    answer: string;
    sources: {
        policy1: Array<{
            pageNumber?: number;
            documentId?: string;
        }>;
        policy2: Array<{
            pageNumber?: number;
            documentId?: string;
        }>;
    };
}
/**
 * Compare policies based on a user's question (for chat interface)
 * This allows users to ask arbitrary questions, not just predefined topics
 * Returns a simple text answer suitable for chat, not the full LanguageComparisonResult
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param question - User's question about the policies
 * @param policy1Name - Name of first policy (for context)
 * @param policy2Name - Name of second policy (for context)
 * @param nChunks - Number of chunks to retrieve per policy (default 7)
 * @returns Simple comparison answer for chat
 */
export declare function comparePoliciesForQuestion(policy1Id: string, policy2Id: string, question: string, policy1Name: string, policy2Name: string, nChunks?: number): Promise<ComparisonAnswer>;
/**
 * Compare policy language for a specific topic using LLM
 * Emphasizes synthesizing broader context, not section-by-section comparison
 * @param policy1Chunks - Chunks from Policy 1
 * @param policy2Chunks - Chunks from Policy 2
 * @param topic - Topic being compared (can be a predefined topic or user's question)
 * @returns Language comparison result
 */
export declare function comparePolicyLanguage(policy1Chunks: SimilarChunk[], policy2Chunks: SimilarChunk[], topic: string): Promise<LanguageComparisonResult>;
/**
 * Compare all topics between two policies
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param topics - Topics to compare (defaults to all)
 * @returns Array of language comparison results
 */
export declare function compareAllTopics(policy1Id: string, policy2Id: string, topics?: readonly string[]): Promise<LanguageComparisonResult[]>;
/**
 * Compare structured policy summary data
 * @param summary1 - First policy summary
 * @param summary2 - Second policy summary
 * @returns Structured comparison of summary fields
 */
export declare function comparePolicySummaries(summary1: PolicySummary, summary2: PolicySummary): StructuredComparison;
/**
 * Generate formatted comparison text for chat display
 * @param structuredComparison - Structured comparison data
 * @param languageComparison - Language comparison results
 * @param policy1Name - Name of first policy
 * @param policy2Name - Name of second policy
 * @returns Formatted text summary
 */
export declare function formatComparisonText(structuredComparison: StructuredComparison, languageComparison: LanguageComparisonResult[], policy1Name: string, policy2Name: string): string;
/**
 * Generate full comparison between two policies
 * Combines structured comparison and language analysis
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param policy1Summary - First policy summary
 * @param policy2Summary - Second policy summary
 * @param policy1Name - Name of first policy
 * @param policy2Name - Name of second policy
 * @returns Full comparison result
 */
export declare function generateFullComparison(policy1Id: string, policy2Id: string, policy1Summary: PolicySummary, policy2Summary: PolicySummary, policy1Name: string, policy2Name: string): Promise<{
    structuredComparison: StructuredComparison;
    languageComparison: LanguageComparisonResult[];
    formattedText: string;
}>;
export {};
//# sourceMappingURL=policyComparisonService.d.ts.map