"use strict";
/**
 * Policy Summary Schema for Pet Insurance
 * Extracted from policy documents using LLM
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.examplePolicySummary = exports.ConfidenceLevel = void 0;
/**
 * Validation and confidence levels for extracted fields
 */
var ConfidenceLevel;
(function (ConfidenceLevel) {
    ConfidenceLevel["HIGH"] = "high";
    ConfidenceLevel["MEDIUM"] = "medium";
    ConfidenceLevel["LOW"] = "low";
})(ConfidenceLevel || (exports.ConfidenceLevel = ConfidenceLevel = {}));
/**
 * Example of a complete policy summary
 */
exports.examplePolicySummary = {
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
//# sourceMappingURL=policySummary.js.map