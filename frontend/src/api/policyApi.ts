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

async function createPolicy(name: string, description?: string): Promise<CreatePolicyResponse> {
  const requestBody: CreatePolicyRequest = {
    name,
    ...(description && { description }),
  };

  return apiClient.post<CreatePolicyResponse>('/policies', requestBody);
}

export const policyApi = {
  createPolicy,
};