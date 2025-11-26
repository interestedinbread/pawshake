/**
 * Error message utility for converting technical errors to user-friendly messages
 */

export interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Network error types
 */
export const ErrorType = {
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION: 'VALIDATION',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * Map backend error messages to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Policy errors
  'Policy ID is required': 'Please select a policy to continue.',
  'Policy ID required': 'Please select a policy to continue.',
  'Policy not found': 'The selected policy could not be found. Please try selecting a different policy.',
  'Policy not found or access denied': 'You don\'t have access to this policy or it no longer exists.',
  'No documents found for this policy': 'This policy doesn\'t have any documents yet. Please upload documents first.',
  'No summary available': 'This policy doesn\'t have a summary yet. Please wait for processing to complete or upload documents.',
  'One or more policies lack summaries': 'One or more selected policies don\'t have summaries yet. Please ensure policies have been processed.',
  
  // Document errors
  'Document ID is required': 'A document is required to perform this action.',
  'Document not found': 'The document could not be found. It may have been deleted.',
  'No files uploaded': 'Please select at least one file to upload.',
  'Invalid file type': 'Please upload a PDF file.',
  'File too large': 'File is too large. Maximum size is 10MB.',
  
  // User/Auth errors
  'User ID required': 'Please log in to continue.',
  'User ID missing': 'Please log in to continue.',
  'User not authenticated': 'Your session has expired. Please log in again.',
  'Email and password are required': 'Please enter both email and password.',
  'Email and password required': 'Please enter both email and password.',
  'Invalid email or password': 'The email or password you entered is incorrect.',
  'User already exists': 'An account with this email already exists.',
  
  // Question/QA errors
  'Question is required and must be a non-empty string': 'Please enter a question.',
  'Provide either a policyId or documentId to scope the question.': 'Please select a policy to ask questions about.',
  
  // Comparison errors
  'Both policy IDs are required': 'Please select two policies to compare.',
  'Policy IDs must be different': 'Please select two different policies to compare.',
  
  // Coverage/Checklist errors
  'No incident description provided': 'Please describe the incident or your pet\'s condition.',
  'Incident description is required': 'Please describe the incident or your pet\'s condition.',
  
  // Name/Validation errors
  'Name is required': 'Please enter a name for your policy.',
  
  // Generic
  'Internal server error': 'Something went wrong on our end. Please try again in a moment.',
  'Unknown error': 'An unexpected error occurred. Please try again.',
};

/**
 * Map HTTP status codes to user-friendly messages
 */
const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  413: 'The file is too large. Please choose a smaller file.',
  415: 'Unsupported file type. Please upload a PDF file.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error: Our servers are experiencing issues. Please try again in a moment.',
  502: 'Service temporarily unavailable. Please try again in a moment.',
  503: 'Service temporarily unavailable. Please try again in a moment.',
  504: 'Request timed out. Please try again.',
};

/**
 * Check if error is a network/connection error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  if (error instanceof Error) {
    return (
      error.message.includes('NetworkError') ||
      error.message.includes('network') ||
      error.message.includes('fetch')
    );
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('Timeout') ||
      error.message.includes('timed out')
    );
  }
  return false;
}

/**
 * Extract error message and status code from various error types
 */
function extractErrorInfo(error: unknown): { message: string; statusCode?: number } {
  // Handle ApiError class (from apiClient) - check for statusCode property
  if (error instanceof Error && 'statusCode' in error && typeof (error as { statusCode: unknown }).statusCode === 'number') {
    return {
      message: error.message,
      statusCode: (error as { statusCode: number }).statusCode,
    };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as ApiErrorResponse;
    return {
      message: apiError.error || apiError.message || 'Unknown error occurred',
    };
  }
  
  return { message: 'An unexpected error occurred' };
}

/**
 * Get user-friendly error message from backend error response
 */
function getBackendErrorMessage(error: string): string {
  // Check exact match first
  if (ERROR_MESSAGE_MAP[error]) {
    return ERROR_MESSAGE_MAP[error];
  }
  
  // Check partial matches (case-insensitive)
  const lowerError = error.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (lowerError.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerError)) {
      return value;
    }
  }
  
  // Return original if no mapping found (might already be user-friendly)
  return error;
}

/**
 * Get error type from error object
 */
export function getErrorType(error: unknown, statusCode?: number): ErrorType {
  if (statusCode) {
    if (statusCode === 401) return ErrorType.UNAUTHORIZED;
    if (statusCode === 404) return ErrorType.NOT_FOUND;
    if (statusCode === 400) return ErrorType.VALIDATION;
    if (statusCode >= 500) return ErrorType.SERVER_ERROR;
  }
  
  if (isNetworkError(error)) return ErrorType.NETWORK;
  if (isTimeoutError(error)) return ErrorType.TIMEOUT;
  
  return ErrorType.UNKNOWN;
}

/**
 * Convert any error to a user-friendly message
 * @param error - The error object (Error, string, or API response)
 * @param statusCode - Optional HTTP status code (will be extracted from ApiError if not provided)
 * @param context - Optional context for more specific messages
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(
  error: unknown,
  statusCode?: number,
  context?: {
    action?: string; // e.g., 'upload', 'generate checklist', 'ask question'
    resource?: string; // e.g., 'policy', 'document', 'checklist'
  }
): string {
  const errorInfo = extractErrorInfo(error);
  const finalStatusCode = statusCode || errorInfo.statusCode;
  const errorType = getErrorType(error, finalStatusCode);
  const rawMessage = errorInfo.message;
  
  // Handle specific error types
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case ErrorType.TIMEOUT:
      return 'The request timed out. The server may be busy. Please try again in a moment.';
    
    case ErrorType.UNAUTHORIZED:
      return 'Your session has expired. Please log in again.';
    
    case ErrorType.NOT_FOUND:
      if (context?.resource) {
        return `The ${context.resource} could not be found. It may have been deleted or you don't have access to it.`;
      }
      return STATUS_CODE_MESSAGES[404] || 'The requested resource was not found.';
    
    case ErrorType.SERVER_ERROR:
      return STATUS_CODE_MESSAGES[statusCode || 500] || 'Server error: Our servers are experiencing issues. Please try again in a moment.';
    
    case ErrorType.VALIDATION: {
      // Try to get user-friendly message from backend error
      const friendlyMessage = getBackendErrorMessage(rawMessage);
      if (friendlyMessage !== rawMessage) {
        return friendlyMessage;
      }
      // If no mapping found, return with context if available
      if (context?.action) {
        return `Invalid input. Please check your ${context.action} and try again.`;
      }
      return STATUS_CODE_MESSAGES[400] || 'Invalid request. Please check your input and try again.';
    }
    
    default: {
      // Try to get user-friendly message from backend error
      const mappedMessage = getBackendErrorMessage(rawMessage);
      if (mappedMessage !== rawMessage) {
        return mappedMessage;
      }
      
      // If status code exists, use status code message
      if (finalStatusCode && STATUS_CODE_MESSAGES[finalStatusCode]) {
        return STATUS_CODE_MESSAGES[finalStatusCode];
      }
      
      // Fallback to generic message
      if (context?.action) {
        return `Failed to ${context.action}. Please try again.`;
      }
      
      return 'Something went wrong. Please try again.';
    }
  }
}

/**
 * Helper to create error handler with context
 */
export function createErrorHandler(context?: {
  action?: string;
  resource?: string;
}) {
  return (error: unknown, statusCode?: number) => {
    return getUserFriendlyErrorMessage(error, statusCode, context);
  };
}

