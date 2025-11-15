import { apiClient } from './apiClient';

interface UploadedDocument {
  id: string;
  filename: string;
  pageCount: number;
  documentType: string;
  createdAt: string;
}

interface UploadResult {
  status: 'success' | 'error';
  document?: UploadedDocument;
  filename?: string;
  error?: string;
}

export interface UploadPolicyResponse {
  message: string;
  policy: {
    id: string;
    name: string;
  };
  results: UploadResult[];
  summary: {
    totalFiles: number;
    successful: number;
    failed: number;
  };
  documents: UploadedDocument[];
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

async function getPolicySummary(policyId: string): Promise<PolicySummaryResponse> {
  return apiClient.get<PolicySummaryResponse>(`/policies/${policyId}/summary`);
}

export const documentApi = {
  uploadPolicy,
  getPolicySummary,
};
