import { apiClient } from './apiClient';

// API base URL - same as apiClient
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Get the auth token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Handle API errors for binary responses
 */
async function handleBinaryError(response: Response): Promise<never> {
  // Try to parse as JSON for error message
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const data = await response.json();
    throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  // If not JSON, throw generic error
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

// Form field types matching backend
export interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'unknown';
  required?: boolean;
  defaultValue?: string;
  options?: string[]; // For dropdowns/radio buttons
}

export interface FormSchema {
  fields: FormField[];
  formName: string;
  pageCount: number;
}

// Additional form data that user provides
export interface AdditionalFormData {
  memberName?: string;
  preferredPhone?: string;
  petName?: string;
  hospitalName?: string;
  condition?: string;
  dateOfFirstSigns?: string; // Format: MM/DD/YY
  petDateOfBirth?: string; // Format: MM/DD/YY
  hasSubmittedPreviously?: boolean;
  previousClaimNumber?: string;
  additionalCondition?: string;
  prescriptionFoodReview?: boolean;
  petInsuredElsewhere?: boolean;
  otherProviderName?: string;
  paymentToVeterinarian?: boolean;
}

interface FillClaimFormRequest {
  policyId: string;
  additionalData?: AdditionalFormData;
}

/**
 * Get the Trupanion claim form schema
 * @returns Form schema with all fields and their properties
 */
async function getFormSchema(): Promise<FormSchema> {
  return apiClient.get<FormSchema>('/claims/form/schema');
}

/**
 * Fill the claim form with policy data and download the PDF
 * @param policyId - The policy ID to use for auto-filling
 * @param additionalData - User-provided claim-specific data
 * @returns Promise that resolves when PDF is downloaded
 */
async function fillClaimForm(
  policyId: string,
  additionalData?: AdditionalFormData
): Promise<void> {
  const url = `${API_BASE_URL}/claims/form/fill`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestBody: FillClaimFormRequest = {
    policyId,
    ...(additionalData && { additionalData }),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    await handleBinaryError(response);
  }

  // Get the PDF blob
  const blob = await response.blob();

  // Extract filename from Content-Disposition header, or use default
  const contentDisposition = response.headers.get('content-disposition');
  let filename = 'trupanion-claim-form-filled.pdf';
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  // Create a download link and trigger download
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export const claimApi = {
  getFormSchema,
  fillClaimForm,
};

