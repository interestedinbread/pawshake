/**
 * Coverage status determination
 */
export type CoverageStatus = boolean | 'partial' | 'unclear';
/**
 * Confidence level for the analysis
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';
/**
 * Required document for claim submission
 */
export interface RequiredDocument {
    documentType: string;
    description: string;
    whyRequired: string;
    deadline?: string;
}
/**
 * Action step for the user to take
 */
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
/**
 * Coverage details breakdown
 */
export interface CoverageDetails {
    coveredAspects: string[];
    excludedAspects?: string[];
    waitingPeriodApplies: boolean;
    deductibleApplies: boolean;
    notes?: string;
}
/**
 * Estimated coverage information
 */
export interface EstimatedCoverage {
    percentage?: number;
    notes?: string;
}
/**
 * Complete coverage checklist result
 */
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
 * Analyze an incident to determine coverage and generate a checklist
 * @param policyId - Policy ID to analyze
 * @param incidentDescription - User's description of the incident
 * @param nChunks - Number of chunks to retrieve (default 10 for comprehensive analysis)
 * @returns Structured coverage checklist
 */
export declare function analyzeIncidentCoverage(policyId: string, incidentDescription: string, nChunks?: number): Promise<CoverageChecklist>;
//# sourceMappingURL=coverageChecklistService.d.ts.map