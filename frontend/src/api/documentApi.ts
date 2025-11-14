import { apiClient } from './apiClient';

interface UploadedDocument {
  id: string;
  filename: string;
  pageCount: number;
  documentType: string;
  createdAt: string;
}

interface UploadPolicyResponse {
  message: string;
  document: UploadedDocument;
  policySummary?: unknown;
}

interface PolicySummaryResponse {
  summary: unknown;
  metadata: {
    createdAt: string;
    updatedAt: string | null;
  };
}

function createUploadFormData(file: File, policyId: string): FormData {
  const formData = new FormData();
  formData.append('files', file); // Backend expects 'files' (array)
  formData.append('policyId', policyId);
  return formData;
}

async function uploadPolicy(file: File, policyId: string): Promise<UploadPolicyResponse> {
  const formData = createUploadFormData(file, policyId);
  return apiClient.postFormData<UploadPolicyResponse>('/documents/upload', formData);
}

async function getPolicySummary(documentId: string): Promise<PolicySummaryResponse> {
  return apiClient.get<PolicySummaryResponse>(`/documents/${documentId}/summary`);
}

export const documentApi = {
  uploadPolicy,
  getPolicySummary,
};
