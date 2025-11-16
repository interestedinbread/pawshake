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

export const policyApi = {
  createPolicy,
  getPolicies
};