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

function createUploadFormData(files: File[], policyId: string): FormData {
  const formData = new FormData();
  // Append all files to 'files' field (backend expects array)
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('policyId', policyId);
  return formData;
}

async function uploadPolicy(files: File[], policyId: string): Promise<UploadPolicyResponse> {
  const formData = createUploadFormData(files, policyId);
  return apiClient.postFormData<UploadPolicyResponse>('/documents/upload', formData);
}

async function getPolicySummary(documentId: string): Promise<PolicySummaryResponse> {
  return apiClient.get<PolicySummaryResponse>(`/documents/${documentId}/summary`);
}

export const documentApi = {
  uploadPolicy,
  getPolicySummary,
};
