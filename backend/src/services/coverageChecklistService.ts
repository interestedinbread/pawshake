import { ChatOpenAI } from '@langchain/openai';
import { querySimilarChunks, SimilarChunk } from './vectorService';
import { env } from '../config/env';

// Initialize OpenAI chat model
const chatModel = new ChatOpenAI({
  openAIApiKey: env.openAIApiKey,
  modelName: 'gpt-4o-mini',
  temperature: 0.3, // Lower temperature for more factual, consistent analysis
});

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
  documentType: string; // e.g., "Veterinary invoice", "Medical records"
  description: string; // What the document should contain
  whyRequired: string; // Why this document is needed
  deadline?: string; // Optional deadline (e.g., "within 30 days")
}

/**
 * Action step for the user to take
 */
export interface ActionStep {
  step: number;
  action: string; // e.g., "Submit claim within 30 days"
  priority: 'high' | 'medium' | 'low';
  deadline?: string; // Optional deadline
  policyReference?: {
    pageNumber?: number;
    section?: string;
  };
}

/**
 * Coverage details breakdown
 */
export interface CoverageDetails {
  coveredAspects: string[]; // e.g., ["surgery", "x-rays", "medications"]
  excludedAspects?: string[]; // e.g., ["pre-existing condition", "routine care"]
  waitingPeriodApplies: boolean;
  deductibleApplies: boolean;
  notes?: string; // Additional coverage notes
}

/**
 * Estimated coverage information
 */
export interface EstimatedCoverage {
  percentage?: number; // Reimbursement percentage (e.g., 90)
  notes?: string; // Additional notes about coverage estimation
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
  warnings?: string[]; // e.g., "Waiting period may apply", "Pre-authorization required"
  summary: string; // Human-readable summary of the analysis
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
export async function analyzeIncidentCoverage(
  policyId: string,
  incidentDescription: string,
  nChunks: number = 10
): Promise<CoverageChecklist> {
  try {
    // Validate input
    if (!incidentDescription || incidentDescription.trim().length === 0) {
      throw new Error('Incident description is required');
    }

    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    // Step 1: Retrieve relevant chunks using multiple queries for comprehensive coverage
    // Query for coverage information related to the incident
    const incidentQuery = incidentDescription;
    
    // Query for general coverage, exclusions, and claim procedures
    const coverageQueries = [
      incidentQuery,
      'coverage types what is covered',
      'exclusions what is not covered',
      'claim submission required documents',
      'waiting period',
      'deductible reimbursement',
    ];

    // Retrieve chunks for all queries
    const allChunksPromises = coverageQueries.map((query) =>
      querySimilarChunks(query, Math.ceil(nChunks / coverageQueries.length), undefined, policyId)
    );

    const chunksArrays = await Promise.all(allChunksPromises);
    
    // Combine and deduplicate chunks (by text content)
    const allChunks: SimilarChunk[] = [];
    const seenTexts = new Set<string>();
    
    for (const chunks of chunksArrays) {
      for (const chunk of chunks) {
        const normalizedText = chunk.text.trim().toLowerCase();
        if (!seenTexts.has(normalizedText)) {
          seenTexts.add(normalizedText);
          allChunks.push(chunk);
        }
      }
    }

    // Limit to nChunks most relevant (prioritize chunks with lower distance)
    const relevantChunks = allChunks
      .sort((a, b) => a.distance - b.distance)
      .slice(0, nChunks);

    if (relevantChunks.length === 0) {
      // Return fallback checklist if no chunks found
      return {
        isCovered: 'unclear',
        confidence: 'low',
        coverageDetails: {
          coveredAspects: [],
          waitingPeriodApplies: false,
          deductibleApplies: false,
        },
        requiredDocuments: [],
        actionSteps: [
          {
            step: 1,
            action: 'Contact your insurance provider to verify coverage',
            priority: 'high',
          },
        ],
        warnings: ['Unable to find relevant policy information. Please contact your insurance provider.'],
        summary: 'Unable to analyze coverage based on available policy information. Please contact your insurance provider directly.',
        sourceChunks: [],
      };
    }

    // Step 2: Build context from retrieved chunks
    const context = relevantChunks
      .map((chunk, index) => {
        const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
        return `[Source ${index + 1}${pageInfo}]:\n${chunk.text}`;
      })
      .join('\n\n---\n\n');

    // Step 3: Build system prompt for structured analysis
    const systemPrompt = `You are an expert at analyzing pet insurance policies to determine coverage for specific incidents.

Your task is to analyze the provided incident description against the policy documents and generate a comprehensive, structured coverage checklist.

IMPORTANT: Return ONLY valid JSON matching this exact structure:
{
  "isCovered": true | false | "partial" | "unclear",
  "confidence": "high" | "medium" | "low",
  "coverageDetails": {
    "coveredAspects": ["list of aspects that ARE covered"],
    "excludedAspects": ["list of aspects that are NOT covered or excluded"],
    "waitingPeriodApplies": true | false,
    "deductibleApplies": true | false,
    "notes": "any additional coverage notes"
  },
  "requiredDocuments": [
    {
      "documentType": "e.g., Veterinary invoice",
      "description": "what the document should contain",
      "whyRequired": "why this document is needed",
      "deadline": "optional deadline if mentioned in policy"
    }
  ],
  "actionSteps": [
    {
      "step": 1,
      "action": "specific action to take",
      "priority": "high" | "medium" | "low",
      "deadline": "optional deadline",
      "policyReference": {
        "pageNumber": 5,
        "section": "optional section name"
      }
    }
  ],
  "estimatedCoverage": {
    "percentage": 90,
    "notes": "optional notes about coverage estimation"
  },
  "warnings": ["any warnings or important notes"],
  "summary": "A clear, concise summary of the coverage analysis (2-3 sentences)"
}

Guidelines:
- Be thorough: extract ALL required documents mentioned in the policy
- Be specific: include exact deadlines, percentages, and requirements from the policy
- Be honest: if information is unclear, set confidence to "medium" or "low" and isCovered to "unclear"
- Prioritize action steps: most urgent/important steps first
- Include page references when available from the source chunks
- Only include information that is explicitly stated in the policy context`;

    const userPrompt = `Analyze coverage for this incident:

Incident Description: "${incidentDescription}"

Policy Context:
${context}

Based on the policy documents above, determine:
1. Is this incident covered? (true/false/partial/unclear)
2. What aspects are covered vs excluded?
3. What documents are required to file a claim?
4. What are the specific steps the user needs to take?
5. Are there any waiting periods, deductibles, or other limitations?
6. What is the estimated reimbursement percentage?

Return ONLY the JSON object matching the structure specified above. Do not include any other text.`;

    // Step 4: Generate analysis using LLM
    const response = await chatModel.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Step 5: Parse LLM response
    const content = response.content as string;
    let checklistData: Omit<CoverageChecklist, 'sourceChunks'>;

    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      checklistData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', parseError);
      // Return fallback checklist
      return {
        isCovered: 'unclear',
        confidence: 'low',
        coverageDetails: {
          coveredAspects: [],
          waitingPeriodApplies: false,
          deductibleApplies: false,
        },
        requiredDocuments: [],
        actionSteps: [
          {
            step: 1,
            action: 'Contact your insurance provider to verify coverage',
            priority: 'high',
          },
        ],
        warnings: ['Unable to parse coverage analysis. Please contact your insurance provider.'],
        summary: 'Unable to analyze coverage. Please contact your insurance provider directly for assistance.',
        sourceChunks: relevantChunks.map((chunk) => ({
          text: chunk.text,
          ...(chunk.pageNumber !== undefined && { pageNumber: chunk.pageNumber }),
          ...(chunk.documentId && { documentId: chunk.documentId }),
        })),
      };
    }

    // Step 6: Prepare source chunks for response
    const sourceChunks = relevantChunks.map((chunk) => ({
      text: chunk.text,
      ...(chunk.pageNumber !== undefined && { pageNumber: chunk.pageNumber }),
      ...(chunk.documentId && { documentId: chunk.documentId }),
    }));

    // Step 7: Return complete checklist
    return {
      ...checklistData,
      sourceChunks,
    };
  } catch (error) {
    console.error(`Error analyzing incident coverage:`, error);
    throw new Error(
      `Failed to analyze coverage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
