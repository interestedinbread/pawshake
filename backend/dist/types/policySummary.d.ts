/**
 * Policy Summary Schema for Pet Insurance
 * Extracted from policy documents using LLM
 */
export interface PolicySummary {
    planName?: string | null;
    policyNumber?: string | null;
    effectiveDate?: string | null;
    expirationDate?: string | null;
    deductible?: DeductibleInfo | null;
    reimbursementRate?: number | null;
    annualMaximum?: number | null;
    perIncidentMaximum?: number | null;
    waitingPeriod?: WaitingPeriodInfo | null;
    coverageTypes?: string[] | null;
    exclusions?: string[] | null;
    requiredDocuments?: string[] | null;
    confidence?: {
        overall?: 'high' | 'medium' | 'low';
        fieldConfidence?: {
            [key: string]: 'high' | 'medium' | 'low';
        };
    } | null;
    sources?: {
        [key: string]: {
            pageNumber?: number;
            chunkId?: string;
            textSnippet?: string;
        }[];
    } | null;
    extractedAt?: string;
    documentId?: string;
    policyId?: string;
}
export interface DeductibleInfo {
    amount: number;
    type: 'annual' | 'per-incident' | 'per-condition' | 'lifetime';
    appliesTo?: string;
}
export interface WaitingPeriodInfo {
    accident?: number;
    illness?: number;
    orthopedic?: number;
    cruciate?: number;
    other?: {
        condition: string;
        days: number;
    }[];
}
/**
 * Validation and confidence levels for extracted fields
 */
export declare enum ConfidenceLevel {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
/**
 * Example of a complete policy summary
 */
export declare const examplePolicySummary: PolicySummary;
//# sourceMappingURL=policySummary.d.ts.map