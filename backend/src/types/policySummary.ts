/**
 * Policy Summary Schema for Pet Insurance
 * Extracted from policy documents using LLM
 */

export interface PolicySummary {
  // Plan Information
  planName?: string | null;
  policyNumber?: string | null;
  effectiveDate?: string | null; // ISO date string
  expirationDate?: string | null; // ISO date string
  
  // Financial Details
  deductible?: DeductibleInfo | null;
  reimbursementRate?: number | null; // Percentage (e.g., 90 = 90%)
  annualMaximum?: number | null; // Dollar amount or "unlimited"
  perIncidentMaximum?: number | null; // Dollar amount or "unlimited"
  
  // Waiting Periods (in days)
  waitingPeriod?: WaitingPeriodInfo | null;
  
  // Coverage Details
  coverageTypes?: string[] | null; // e.g., ["accident", "illness", "wellness", "dental"]
  exclusions?: string[] | null; // List of excluded conditions/services
  
  // Required Documentation for Claims
  requiredDocuments?: string[] | null; // e.g., ["invoice", "medical records", "receipt"]
  
  // Confidence and Source Tracking
  confidence?: {
    overall?: 'high' | 'medium' | 'low';
    fieldConfidence?: {
      [key: string]: 'high' | 'medium' | 'low';
    };
  } | null;
  
  // Source citations for each field (page numbers, chunk IDs)
  sources?: {
    [key: string]: {
      pageNumber?: number;
      chunkId?: string;
      textSnippet?: string;
    }[];
  } | null;
  
  // Metadata
  extractedAt?: string; // ISO timestamp
  documentId?: string; // Reference to the document
}

export interface DeductibleInfo {
  amount: number; // Dollar amount
  type: 'annual' | 'per-incident' | 'per-condition' | 'lifetime';
  appliesTo?: string; // e.g., "accident and illness"
}

export interface WaitingPeriodInfo {
  accident?: number; // Days
  illness?: number; // Days
  orthopedic?: number; // Days (often longer)
  cruciate?: number; // Days (often longer)
  other?: {
    condition: string;
    days: number;
  }[];
}

/**
 * Validation and confidence levels for extracted fields
 */
export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Example of a complete policy summary
 */
export const examplePolicySummary: PolicySummary = {
  planName: "Complete Coverage Plan",
  policyNumber: "PET-12345",
  effectiveDate: "2024-01-15",
  expirationDate: "2025-01-15",
  deductible: {
    amount: 250,
    type: "annual",
    appliesTo: "accident and illness"
  },
  reimbursementRate: 90,
  annualMaximum: 10000,
  perIncidentMaximum: null,
  waitingPeriod: {
    accident: 0,
    illness: 14,
    orthopedic: 14,
    cruciate: 14
  },
  coverageTypes: ["accident", "illness", "dental", "prescription"],
  exclusions: [
    "pre-existing conditions",
    "breeding costs",
    "cosmetic procedures"
  ],
  requiredDocuments: [
    "itemized invoice",
    "medical records",
    "receipt"
  ],
  confidence: {
    overall: "high",
    fieldConfidence: {
      deductible: "high",
      reimbursementRate: "high",
      waitingPeriod: "medium"
    }
  },
  sources: {
    deductible: [
      {
        pageNumber: 3,
        textSnippet: "Annual deductible of $250 applies to all covered conditions"
      }
    ],
    reimbursementRate: [
      {
        pageNumber: 4,
        textSnippet: "90% reimbursement rate for covered expenses"
      }
    ]
  }
};

