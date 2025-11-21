import { apiClient } from './apiClient';

interface Policy {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CreatePolicyResponse {
  result: Policy;
}

interface CreatePolicyRequest {
  name: string;
  description?: string;
}

interface GetPoliciesResponse {
  policies: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    documentCount: number;
    lastDocumentAt: string | null;
    summaryUpdatedAt: string | null;
    summaryConfidence: 'high' | 'medium' | 'low' | null;
    hasSummary: boolean;
  }>;
}

// Response from backend /api/policies/compare
interface BackendPolicyComparisonItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  summary: unknown | null;
  summaryMetadata: {
    createdAt: string;
    updatedAt: string;
    confidence: 'high' | 'medium' | 'low' | null;
  } | null;
  hasSummary: boolean;
}

interface BackendComparisonResponse {
  policies: BackendPolicyComparisonItem[];
  comparisonReady: boolean;
}

// Chat-style comparison answer
export interface ComparisonAnswer {
  answer: string;
  sources: {
    policy1: Array<{ pageNumber?: number; documentId?: string }>;
    policy2: Array<{ pageNumber?: number; documentId?: string }>;
  };
}

async function createPolicy(name: string, description?: string): Promise<CreatePolicyResponse> {
  const requestBody: CreatePolicyRequest = {
    name,
    ...(description && { description }),
  };

  return apiClient.post<CreatePolicyResponse>('/policies', requestBody);
}

async function getPolicies(): Promise<GetPoliciesResponse> {
  return apiClient.get<GetPoliciesResponse>('/policies')
}

/**
 * Fetch basic comparison data (metadata + summaries) for two policies.
 * This wraps GET /api/policies/compare.
 */
async function getPolicyComparison(
  policyId1: string,
  policyId2: string
): Promise<BackendComparisonResponse> {
  const params = new URLSearchParams({ policyId1, policyId2 }).toString();
  return apiClient.get<BackendComparisonResponse>(`/policies/compare?${params}`);
}

interface ReExtractSummaryResponse {
  message: string;
  summary: unknown;
}

async function reExtractPolicySummary(policyId: string): Promise<ReExtractSummaryResponse> {
  return apiClient.post<ReExtractSummaryResponse>(`/policies/${policyId}/summary/extract`);
}

/**
 * Ask a comparison question about two policies (chat-style).
 * Wraps POST /api/policies/compare/ask.
 */
async function askComparisonQuestion(
  policyId1: string,
  policyId2: string,
  question: string
): Promise<ComparisonAnswer> {
  const body = {
    policyId1,
    policyId2,
    question: question.trim(),
  };

  return apiClient.post<ComparisonAnswer>('/policies/compare/ask', body);
}

export const policyApi = {
  createPolicy,
  getPolicies,
  reExtractPolicySummary,
  getPolicyComparison,
  askComparisonQuestion,
};