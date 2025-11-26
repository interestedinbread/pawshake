import { PolicySummary } from './policySummary';

/**
 * Policy comparison response types
 */

export interface PolicyComparisonItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  summary: PolicySummary | null;
  summaryMetadata: {
    createdAt: string;
    updatedAt: string;
    confidence: 'high' | 'medium' | 'low' | null;
  } | null;
  hasSummary: boolean;
}

/**
 * Response from comparison endpoint
 * Phase 1: Just returns policy data
 * Future phases: Will include structured comparison and language analysis
 */
export interface ComparisonResponse {
  policies: PolicyComparisonItem[];
  comparisonReady: boolean;
  // Future fields to be added:
  // structuredComparison?: StructuredComparison;
  // languageComparison?: LanguageComparisonResult[];
}

