import { apiClient } from "./apiClient";

export type CoverageStatus = boolean | 'partial' | 'unclear';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface RequiredDocument {
  documentType: string; 
  description: string; 
  whyRequired: string;
  deadline?: string; 
}

export interface ActionStep {
  step: number;
  action: string; 
  priority: 'high' | 'medium' | 'low';
  deadline?: string; 
  policyReference?: {
    pageNumber?: number;
    section?: string;
  };
}

export interface CoverageDetails {
  coveredAspects: string[]; 
  excludedAspects?: string[]; 
  waitingPeriodApplies: boolean;
  deductibleApplies: boolean;
  notes?: string; 
}


export interface EstimatedCoverage {
  percentage?: number;
  notes?: string; 
}

export interface CoverageChecklist {
  isCovered: CoverageStatus;
  confidence: ConfidenceLevel;
  coverageDetails: CoverageDetails;
  requiredDocuments: RequiredDocument[];
  actionSteps: ActionStep[];
  estimatedCoverage?: EstimatedCoverage;
  warnings?: string[];
  summary: string;
  sourceChunks: Array<{
    text: string;
    pageNumber?: number;
    documentId?: string;
  }>;
}

/**
 * Check coverage for an incident.
 * Wraps POST /api/policies/:policyId/coverage-check.
 */
async function checkCoverage(
  policyId: string,
  incidentDescription: string
): Promise<CoverageChecklist> {
  const body = {
    incidentDescription: incidentDescription.trim(),
  };

  return apiClient.post<CoverageChecklist>(`/policies/${policyId}/coverage-check`, body);
}

export const coverageApi = {
  checkCoverage,
};