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

function createUploadFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

async function uploadPolicy(file: File): Promise<UploadPolicyResponse> {
  const formData = createUploadFormData(file);
  return apiClient.postFormData<UploadPolicyResponse>('/documents/upload', formData);
}

async function getPolicySummary(documentId: string): Promise<PolicySummaryResponse> {
  return apiClient.get<PolicySummaryResponse>(`/documents/${documentId}/summary`);
}

export const documentApi = {
  uploadPolicy,
  getPolicySummary,
};
