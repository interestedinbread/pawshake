"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPolicySummary = extractPolicySummary;
const openai_1 = require("@langchain/openai");
const vectorService_1 = require("./vectorService");
const env_1 = require("../config/env");
// Initialize OpenAI chat model for extraction
const extractionModel = new openai_1.ChatOpenAI({
    openAIApiKey: env_1.env.openAIApiKey,
    modelName: 'gpt-4o-mini', // Can upgrade to gpt-4o for better extraction
    temperature: 0.1, // Very low temperature for consistent, factual extraction
});
/**
 * Extract structured policy information from document text using LLM
 * @param documentText - Full text content of the policy document
 * @param documentId - Document ID for RAG verification and source citations
 * @param pageCount - Number of pages (for source tracking)
 * @returns Structured policy summary with confidence levels and sources
 */
async function extractPolicySummary(documentText, documentId, policyId, pageCount) {
    try {
        // Validate input
        if (!documentText || documentText.trim().length === 0) {
            throw new Error('Document text is required');
        }
        if (!documentId) {
            throw new Error('Document ID is required');
        }
        if (!policyId) {
            throw new Error('Policy ID is required');
        }
        // Step 1: Build extraction prompt with few-shot examples
        const extractionPrompt = buildExtractionPrompt(documentText);
        // Step 2: Request structured extraction from LLM
        // gpt-4o-mini supports ~128k tokens, so we can safely use much more text
        // Use up to 100k characters (roughly ~25k tokens) to ensure we capture all documents
        const maxChars = 100000;
        const truncatedText = documentText.length > maxChars
            ? documentText.substring(0, maxChars) + '\n\n[... document truncated due to length ...]'
            : documentText;
        const response = await extractionModel.invoke([
            { role: 'system', content: extractionPrompt },
            {
                role: 'user',
                content: `Extract the policy information from the following document(s). The text may contain multiple related documents concatenated together. Look for the most complete and authoritative information across all documents. Return ONLY valid JSON matching the PolicySummary schema:\n\n${truncatedText}`
            },
        ]);
        // Step 3: Parse JSON response
        let extractedSummary;
        try {
            const responseText = response.content;
            // Extract JSON from response (handle markdown code blocks if present)
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
            extractedSummary = JSON.parse(jsonText);
        }
        catch (parseError) {
            throw new Error(`Failed to parse LLM response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
        // Step 4: Post-process and validate extracted fields
        const validatedSummary = await postProcessAndValidate(extractedSummary);
        // Step 5: Use RAG to verify and get source citations
        const summaryWithSources = await addSourceCitations(validatedSummary, documentId, policyId);
        // Step 6: Add metadata
        summaryWithSources.documentId = documentId;
        summaryWithSources.policyId = policyId;
        summaryWithSources.extractedAt = new Date().toISOString();
        return summaryWithSources;
    }
    catch (error) {
        throw new Error(`Failed to extract policy summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Build the extraction prompt with few-shot examples
 */
function buildExtractionPrompt(documentText) {
    return `You are an expert at extracting structured information from pet insurance policy documents. You may receive text from multiple related documents (e.g., policy documents, declarations pages, coverage summaries). When information appears in multiple documents, prioritize the most authoritative source (typically declarations pages or policy summaries).

Your task is to extract policy information and return it as a JSON object matching this exact schema:
{
  "planName": string or null,
  "policyNumber": string or null,
  "effectiveDate": "YYYY-MM-DD" or null,
  "expirationDate": "YYYY-MM-DD" or null,
  "deductible": {
    "amount": number,
    "type": "annual" | "per-incident" | "per-condition" | "lifetime",
    "appliesTo": string or null
  } or null,
  "reimbursementRate": number (0-100) or null,
  "annualMaximum": number or "unlimited" or null,
  "perIncidentMaximum": number or "unlimited" or null,
  "waitingPeriod": {
    "accident": number (days) or null,
    "illness": number (days) or null,
    "orthopedic": number (days) or null,
    "cruciate": number (days) or null
  } or null,
  "coverageTypes": array of strings or null,
  "exclusions": array of strings or null,
  "requiredDocuments": array of strings or null,
  "confidence": {
    "overall": "high" | "medium" | "low",
    "fieldConfidence": {
      "deductible": "high" | "medium" | "low",
      "reimbursementRate": "high" | "medium" | "low",
      ...
    }
  } or null
}

Guidelines:
- Return null for fields you cannot find or are uncertain about
- Use "high" confidence when information is explicitly stated and clear
- Use "medium" confidence when information is implied or partially stated
- Use "low" confidence when information is ambiguous or conflicting
- For dates, use ISO format (YYYY-MM-DD)
- For percentages, use numbers (e.g., 90 for 90%)
- For dollar amounts, use numbers only (no $ or commas)
- Extract exclusions as a list of strings describing what's NOT covered
- Extract coverageTypes as a list of what IS covered (e.g., ["accident", "illness", "dental"])

Return ONLY valid JSON, no additional text or explanation.`;
}
/**
 * Post-process and validate extracted fields using regex and heuristics
 */
async function postProcessAndValidate(summary) {
    const validated = { ...summary };
    const fieldConfidence = {};
    // Validate and normalize deductible
    if (validated.deductible) {
        const deductible = validated.deductible;
        if (typeof deductible.amount !== 'number' || deductible.amount < 0) {
            validated.deductible = null;
            fieldConfidence.deductible = 'low';
        }
        else {
            fieldConfidence.deductible = 'high';
        }
    }
    // Validate reimbursement rate (0-100)
    if (validated.reimbursementRate !== null && validated.reimbursementRate !== undefined) {
        if (typeof validated.reimbursementRate !== 'number' ||
            validated.reimbursementRate < 0 ||
            validated.reimbursementRate > 100) {
            validated.reimbursementRate = null;
            fieldConfidence.reimbursementRate = 'low';
        }
        else {
            fieldConfidence.reimbursementRate = 'high';
        }
    }
    // Validate waiting periods (should be positive numbers)
    if (validated.waitingPeriod) {
        const wp = validated.waitingPeriod;
        if (wp.accident !== undefined && (typeof wp.accident !== 'number' || wp.accident < 0)) {
            delete wp.accident;
        }
        if (wp.illness !== undefined && (typeof wp.illness !== 'number' || wp.illness < 0)) {
            delete wp.illness;
        }
        if (wp.orthopedic !== undefined && (typeof wp.orthopedic !== 'number' || wp.orthopedic < 0)) {
            delete wp.orthopedic;
        }
        if (wp.cruciate !== undefined && (typeof wp.cruciate !== 'number' || wp.cruciate < 0)) {
            delete wp.cruciate;
        }
    }
    // Validate annual maximum and per-incident maximum
    // Note: These can be number, string ("unlimited"), or null
    const annualMaxValue = validated.annualMaximum;
    if (annualMaxValue !== null && annualMaxValue !== undefined) {
        if (typeof annualMaxValue === 'string') {
            if (annualMaxValue.toLowerCase() === 'unlimited') {
                // Keep as string
                fieldConfidence.annualMaximum = 'high';
            }
            else {
                validated.annualMaximum = null;
                fieldConfidence.annualMaximum = 'low';
            }
        }
        else if (typeof annualMaxValue === 'number' && annualMaxValue > 0) {
            fieldConfidence.annualMaximum = 'high';
        }
        else {
            validated.annualMaximum = null;
            fieldConfidence.annualMaximum = 'low';
        }
    }
    const perIncidentMaxValue = validated.perIncidentMaximum;
    if (perIncidentMaxValue !== null && perIncidentMaxValue !== undefined) {
        if (typeof perIncidentMaxValue === 'string') {
            if (perIncidentMaxValue.toLowerCase() === 'unlimited') {
                fieldConfidence.perIncidentMaximum = 'high';
            }
            else {
                validated.perIncidentMaximum = null;
                fieldConfidence.perIncidentMaximum = 'low';
            }
        }
        else if (typeof perIncidentMaxValue === 'number' && perIncidentMaxValue > 0) {
            fieldConfidence.perIncidentMaximum = 'high';
        }
        else {
            validated.perIncidentMaximum = null;
            fieldConfidence.perIncidentMaximum = 'low';
        }
    }
    // Calculate overall confidence
    const confidenceValues = Object.values(fieldConfidence);
    let overallConfidence = 'medium';
    if (confidenceValues.length === 0) {
        overallConfidence = 'low';
    }
    else if (confidenceValues.every(c => c === 'high')) {
        overallConfidence = 'high';
    }
    else if (confidenceValues.some(c => c === 'low')) {
        overallConfidence = 'low';
    }
    validated.confidence = {
        overall: overallConfidence,
        fieldConfidence,
    };
    return validated;
}
/**
 * Use RAG to verify extracted fields and get source citations
 */
async function addSourceCitations(summary, documentId, policyId) {
    const sources = {};
    // Similarity threshold for filtering citations
    // Lower distance = higher similarity (0 = identical, 1 = completely different)
    const CITATION_SIMILARITY_THRESHOLD = 0.4;
    // Maximum number of citations to show per field
    const MAX_CITATIONS_PER_FIELD = 2;
    // Verify and get citations for key fields
    const fieldsToVerify = [
        { key: 'deductible', query: 'deductible amount annual per incident' },
        { key: 'reimbursementRate', query: 'reimbursement rate percentage coverage' },
        { key: 'waitingPeriod', query: 'waiting period days accident illness' },
        { key: 'annualMaximum', query: 'annual maximum coverage limit yearly' },
        { key: 'exclusions', query: 'exclusions not covered pre-existing conditions' },
    ];
    for (const field of fieldsToVerify) {
        if (summary[field.key] !== null &&
            summary[field.key] !== undefined) {
            try {
                // Retrieve chunks for context (helps with verification)
                const chunks = await (0, vectorService_1.querySimilarChunks)(field.query, 3, undefined, policyId);
                if (chunks.length > 0) {
                    // Filter by similarity threshold and limit to top N
                    // Note: ChromaDB uses cosine distance (0-2 range), so threshold may need adjustment
                    let citationChunks = chunks
                        .filter((chunk) => chunk.distance < CITATION_SIMILARITY_THRESHOLD)
                        .slice(0, MAX_CITATIONS_PER_FIELD);
                    // Fallback: If no chunks pass the threshold, show at least the top 1 most relevant chunk
                    if (citationChunks.length === 0 && chunks[0]) {
                        citationChunks = [chunks[0]]; // Top result is always most similar
                    }
                    if (citationChunks.length > 0) {
                        // Simplified citations: only include page numbers (no text snippets)
                        sources[field.key] = citationChunks
                            .filter((chunk) => chunk.pageNumber !== undefined) // Only include chunks with page numbers
                            .map(chunk => {
                            const source = {};
                            if (chunk.pageNumber !== undefined) {
                                source.pageNumber = chunk.pageNumber;
                            }
                            if (chunk.documentId) {
                                source.chunkId = chunk.documentId;
                            }
                            return source;
                        });
                    }
                }
            }
            catch (error) {
                // If RAG fails, continue without sources for this field
                console.warn(`Failed to get sources for ${field.key}:`, error);
            }
        }
    }
    summary.sources = sources;
    return summary;
}
//# sourceMappingURL=extractionService.js.map