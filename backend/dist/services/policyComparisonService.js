"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicyContextForTopic = getPolicyContextForTopic;
exports.getComparisonContext = getComparisonContext;
exports.comparePoliciesForQuestion = comparePoliciesForQuestion;
exports.comparePolicyLanguage = comparePolicyLanguage;
exports.compareAllTopics = compareAllTopics;
exports.comparePolicySummaries = comparePolicySummaries;
exports.formatComparisonText = formatComparisonText;
exports.generateFullComparison = generateFullComparison;
const openai_1 = require("@langchain/openai");
const vectorService_1 = require("./vectorService");
// Initialize OpenAI chat model (same as qaService)
const openAIApiKey = process.env.OPENAI_API_KEY;
if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
}
const chatModel = new openai_1.ChatOpenAI({
    openAIApiKey: openAIApiKey,
    modelName: 'gpt-4o-mini',
    temperature: 0.3,
});
/**
 * Key topics to compare between policies
 * These will be used as query strings for vector search
 */
const COMPARISON_TOPICS = [
    'deductible',
    'reimbursement rate',
    'coverage types',
    'waiting period',
    'exclusions',
    'annual maximum',
];
/**
 * Get policy context (chunks) for a specific topic using RAG
 * @param policyId - Policy ID to query
 * @param topic - Topic to search for (e.g., "deductible", "coverage")
 * @param nChunks - Number of chunks to retrieve (default 5-7)
 * @returns Array of relevant chunks for the topic
 */
async function getPolicyContextForTopic(policyId, topic, nChunks = 7) {
    try {
        // Use vector search to find relevant chunks for this topic
        const chunks = await (0, vectorService_1.querySimilarChunks)(topic, nChunks, undefined, // No document filter
        policyId // Filter by policy ID
        );
        return chunks;
    }
    catch (error) {
        console.error(`Error retrieving context for topic "${topic}" in policy ${policyId}:`, error);
        return [];
    }
}
/**
 * Get comparison context for both policies on all topics
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param topics - Topics to compare (defaults to all)
 * @returns Comparison context grouped by topic
 */
async function getComparisonContext(policy1Id, policy2Id, topics = COMPARISON_TOPICS) {
    const contexts = [];
    for (const topic of topics) {
        try {
            // Get chunks from both policies for this topic
            const [policy1Chunks, policy2Chunks] = await Promise.all([
                getPolicyContextForTopic(policy1Id, topic, 7),
                getPolicyContextForTopic(policy2Id, topic, 7),
            ]);
            // Only include topics that have chunks from at least one policy
            if (policy1Chunks.length > 0 || policy2Chunks.length > 0) {
                contexts.push({
                    topic,
                    policy1Chunks,
                    policy2Chunks,
                });
            }
        }
        catch (error) {
            console.error(`Error getting comparison context for topic "${topic}":`, error);
            // Continue with other topics even if one fails
        }
    }
    return contexts;
}
/**
 * Compare policies based on a user's question (for chat interface)
 * This allows users to ask arbitrary questions, not just predefined topics
 * Returns a simple text answer suitable for chat, not the full LanguageComparisonResult
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param question - User's question about the policies
 * @param policy1Name - Name of first policy (for context)
 * @param policy2Name - Name of second policy (for context)
 * @param nChunks - Number of chunks to retrieve per policy (default 7)
 * @returns Simple comparison answer for chat
 */
async function comparePoliciesForQuestion(policy1Id, policy2Id, question, policy1Name, policy2Name, nChunks = 7) {
    try {
        // Get relevant chunks for both policies based on the user's question
        const [policy1Chunks, policy2Chunks] = await Promise.all([
            getPolicyContextForTopic(policy1Id, question, nChunks),
            getPolicyContextForTopic(policy2Id, question, nChunks),
        ]);
        // Build context from chunks
        const policy1Context = policy1Chunks
            .map((chunk, index) => {
            const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
            return `[${policy1Name}, Section ${index + 1}${pageInfo}]:\n${chunk.text}`;
        })
            .join('\n\n---\n\n');
        const policy2Context = policy2Chunks
            .map((chunk, index) => {
            const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
            return `[${policy2Name}, Section ${index + 1}${pageInfo}]:\n${chunk.text}`;
        })
            .join('\n\n---\n\n');
        // Build prompt for natural language answer (like QA)
        const systemPrompt = `You are a helpful assistant that compares pet insurance policies.
Your answers should be:
- Clear and conversational, as if explaining to a friend
- Focus on answering the user's specific question
- Highlight key differences between the two policies
- Include specific details like dollar amounts, percentages, and time periods when available
- At the end, suggest which policy might be better for the user's question (if applicable)

IMPORTANT: At the end of your answer, add a brief note suggesting which page(s) the user should refer to for more details.
For example: "For more details, refer to page X of ${policy1Name} and page Y of ${policy2Name}."

If the provided context doesn't contain enough information to fully answer the question, say so honestly.
Do not make up information that isn't in the provided context.`;
        const userPrompt = `The user asked: "${question}"

Compare how ${policy1Name} and ${policy2Name} handle this:

${policy1Name} - relevant sections:
${policy1Context || 'No relevant sections found'}

${policy2Name} - relevant sections:
${policy2Context || 'No relevant sections found'}

Provide a clear, conversational comparison that directly answers the user's question.`;
        const response = await chatModel.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ]);
        const answer = response.content;
        // Extract source page numbers
        const sources = {
            policy1: policy1Chunks
                .filter((chunk) => chunk.pageNumber !== undefined)
                .map((chunk) => ({
                ...(chunk.pageNumber !== undefined && { pageNumber: chunk.pageNumber }),
                ...(chunk.documentId && { documentId: chunk.documentId }),
            })),
            policy2: policy2Chunks
                .filter((chunk) => chunk.pageNumber !== undefined)
                .map((chunk) => ({
                ...(chunk.pageNumber !== undefined && { pageNumber: chunk.pageNumber }),
                ...(chunk.documentId && { documentId: chunk.documentId }),
            })),
        };
        return {
            answer,
            sources,
        };
    }
    catch (error) {
        console.error(`Error comparing policies for question "${question}":`, error);
        throw error;
    }
}
/**
 * Compare policy language for a specific topic using LLM
 * Emphasizes synthesizing broader context, not section-by-section comparison
 * @param policy1Chunks - Chunks from Policy 1
 * @param policy2Chunks - Chunks from Policy 2
 * @param topic - Topic being compared (can be a predefined topic or user's question)
 * @returns Language comparison result
 */
async function comparePolicyLanguage(policy1Chunks, policy2Chunks, topic) {
    try {
        // Build context from all chunks (like RAG does)
        const policy1Context = policy1Chunks
            .map((chunk, index) => {
            const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
            return `[Policy 1, Section ${index + 1}${pageInfo}]:\n${chunk.text}`;
        })
            .join('\n\n---\n\n');
        const policy2Context = policy2Chunks
            .map((chunk, index) => {
            const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
            return `[Policy 2, Section ${index + 1}${pageInfo}]:\n${chunk.text}`;
        })
            .join('\n\n---\n\n');
        // Build comparison prompt that emphasizes synthesis
        const systemPrompt = `You are an expert at analyzing and comparing pet insurance policy documents. 
When comparing policies, you should:
1. SYNTHESIZE the broader context from all provided sections - don't just compare individual clauses
2. Understand how all the clauses work together to form the overall policy approach
3. Identify key differences in the overall structure and language, not just wording
4. Determine which policy is more comprehensive, strict, or lenient
5. Provide specific examples from the text to support your analysis

Return your response as valid JSON with this structure:
{
  "policy1Summary": "Synthesized understanding of Policy 1's approach to [topic]",
  "policy2Summary": "Synthesized understanding of Policy 2's approach to [topic]",
  "keyDifferences": [
    {
      "aspect": "Specific aspect being compared",
      "policy1Approach": "How Policy 1 handles this",
      "policy2Approach": "How Policy 2 handles this",
      "analysis": "Your insight on the difference"
    }
  ],
  "overallComparison": "High-level comparison of the overall approach",
  "whichIsBetter": "policy1" | "policy2" | "similar" | "depends",
  "reasoning": "Explanation of which is better and why"
}`;
        const userPrompt = `Compare how these two policies handle ${topic}. 

IMPORTANT: Synthesize the broader context from ALL the sections provided below. Don't compare individual sections - understand how all the clauses work together to form each policy's overall approach to ${topic}.

Policy 1 - ${topic} sections:
${policy1Context || 'No relevant sections found'}

Policy 2 - ${topic} sections:
${policy2Context || 'No relevant sections found'}

Analyze:
1. What is Policy 1's overall approach to ${topic}? (synthesize all sections together)
2. What is Policy 2's overall approach to ${topic}? (synthesize all sections together)
3. What are the key differences in their overall approaches?
4. Which policy is more comprehensive/strict/lenient for ${topic}?
5. Provide specific examples from the text

Return ONLY valid JSON matching the structure specified above.`;
        const response = await chatModel.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ]);
        // Parse LLM response
        const content = response.content;
        let comparisonResult;
        try {
            // Try to extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonContent = jsonMatch ? jsonMatch[0] : content;
            comparisonResult = JSON.parse(jsonContent);
        }
        catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', parseError);
            // Fallback: return a basic comparison
            comparisonResult = {
                policy1Summary: 'Unable to analyze Policy 1',
                policy2Summary: 'Unable to analyze Policy 2',
                keyDifferences: [],
                overallComparison: 'Could not parse comparison results',
                whichIsBetter: 'depends',
                reasoning: 'LLM response could not be parsed',
            };
        }
        // Prepare source chunks for response
        const sourceChunks = {
            policy1: policy1Chunks.map((chunk) => ({
                text: chunk.text,
                ...(chunk.pageNumber !== undefined && { pageNumber: chunk.pageNumber }),
                ...(chunk.documentId && { documentId: chunk.documentId }),
            })),
            policy2: policy2Chunks.map((chunk) => ({
                text: chunk.text,
                ...(chunk.pageNumber !== undefined && { pageNumber: chunk.pageNumber }),
                ...(chunk.documentId && { documentId: chunk.documentId }),
            })),
        };
        return {
            topic,
            ...comparisonResult,
            sourceChunks,
        };
    }
    catch (error) {
        console.error(`Error in comparePolicyLanguage for topic "${topic}":`, error);
        // Return fallback result
        return {
            topic,
            policy1Summary: 'Error analyzing Policy 1',
            policy2Summary: 'Error analyzing Policy 2',
            keyDifferences: [],
            overallComparison: 'Unable to complete language comparison',
            whichIsBetter: 'depends',
            reasoning: error instanceof Error ? error.message : 'Unknown error',
            sourceChunks: {
                policy1: [],
                policy2: [],
            },
        };
    }
}
/**
 * Compare all topics between two policies
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param topics - Topics to compare (defaults to all)
 * @returns Array of language comparison results
 */
async function compareAllTopics(policy1Id, policy2Id, topics = COMPARISON_TOPICS) {
    // Get comparison context for all topics
    const contexts = await getComparisonContext(policy1Id, policy2Id, topics);
    // Compare each topic using LLM
    const comparisons = [];
    for (const context of contexts) {
        try {
            // Only compare if we have chunks from at least one policy
            if (context.policy1Chunks.length > 0 || context.policy2Chunks.length > 0) {
                const comparison = await comparePolicyLanguage(context.policy1Chunks, context.policy2Chunks, context.topic);
                comparisons.push(comparison);
            }
        }
        catch (error) {
            console.error(`Error comparing topic "${context.topic}":`, error);
            // Continue with other topics even if one fails
        }
    }
    return comparisons;
}
/**
 * Compare structured policy summary data
 * @param summary1 - First policy summary
 * @param summary2 - Second policy summary
 * @returns Structured comparison of summary fields
 */
function comparePolicySummaries(summary1, summary2) {
    // Helper to determine which is better for numeric values (lower is better for costs, higher is better for coverage)
    const compareNumeric = (val1, val2, lowerIsBetter = false) => {
        if (val1 === null || val1 === undefined || val2 === null || val2 === undefined) {
            return 'different';
        }
        if (val1 === val2)
            return 'same';
        if (lowerIsBetter) {
            return val1 < val2 ? 'policy1_better' : 'policy2_better';
        }
        else {
            return val1 > val2 ? 'policy1_better' : 'policy2_better';
        }
    };
    // Helper to compare deductible amounts
    const compareDeductible = () => {
        const d1 = summary1.deductible;
        const d2 = summary2.deductible;
        if (!d1 && !d2)
            return 'same';
        if (!d1 || !d2)
            return 'different';
        if (d1.amount === d2.amount && d1.type === d2.type)
            return 'same';
        // Lower deductible is better
        return d1.amount < d2.amount ? 'policy1_better' : 'policy2_better';
    };
    // Helper to compare arrays
    const compareArrays = (arr1, arr2) => {
        if (!arr1 && !arr2)
            return 'same';
        if (!arr1 || !arr2)
            return 'different';
        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
        if (set1.size === set2.size && [...set1].every(item => set2.has(item))) {
            return 'same';
        }
        // More coverage types is better, fewer exclusions is better
        // For now, just return 'different' - could be more sophisticated
        return 'different';
    };
    // Helper to compare waiting periods
    const compareWaitingPeriods = () => {
        const wp1 = summary1.waitingPeriod;
        const wp2 = summary2.waitingPeriod;
        if (!wp1 && !wp2)
            return 'same';
        if (!wp1 || !wp2)
            return 'different';
        // Shorter waiting periods are better
        const fields = ['accident', 'illness', 'orthopedic', 'cruciate'];
        let policy1Better = 0;
        let policy2Better = 0;
        for (const field of fields) {
            const val1 = wp1[field];
            const val2 = wp2[field];
            if (val1 !== undefined && val2 !== undefined) {
                if (val1 < val2)
                    policy1Better++;
                else if (val2 < val1)
                    policy2Better++;
            }
        }
        if (policy1Better > policy2Better)
            return 'policy1_better';
        if (policy2Better > policy1Better)
            return 'policy2_better';
        if (policy1Better === policy2Better && policy1Better === 0) {
            // Check if all values are the same
            const allSame = fields.every(field => {
                const v1 = wp1[field];
                const v2 = wp2[field];
                return v1 === v2 || (v1 === undefined && v2 === undefined);
            });
            return allSame ? 'same' : 'different';
        }
        return 'same';
    };
    return {
        deductible: {
            policy1: summary1.deductible,
            policy2: summary2.deductible,
            comparison: compareDeductible(),
        },
        reimbursementRate: {
            policy1: summary1.reimbursementRate ?? null,
            policy2: summary2.reimbursementRate ?? null,
            comparison: compareNumeric(summary1.reimbursementRate, summary2.reimbursementRate, false), // Higher is better
        },
        annualMaximum: {
            policy1: summary1.annualMaximum ?? null,
            policy2: summary2.annualMaximum ?? null,
            comparison: (() => {
                const max1 = summary1.annualMaximum;
                const max2 = summary2.annualMaximum;
                // Note: Type is number | null, but null might represent "unlimited" in practice
                // If both are null, treat as same (could be unlimited or missing data)
                if (max1 === null && max2 === null)
                    return 'same';
                if (max1 === null)
                    return 'policy2_better'; // null might mean unlimited, which is better
                if (max2 === null)
                    return 'policy1_better';
                // Compare numeric values
                return compareNumeric(max1, max2, false);
            })(), // Higher is better
        },
        perIncidentMaximum: {
            policy1: summary1.perIncidentMaximum ?? null,
            policy2: summary2.perIncidentMaximum ?? null,
            comparison: (() => {
                const max1 = summary1.perIncidentMaximum;
                const max2 = summary2.perIncidentMaximum;
                // Note: Type is number | null, but null might represent "unlimited" in practice
                // If both are null, treat as same (could be unlimited or missing data)
                if (max1 === null && max2 === null)
                    return 'same';
                if (max1 === null)
                    return 'policy2_better'; // null might mean unlimited, which is better
                if (max2 === null)
                    return 'policy1_better';
                // Compare numeric values
                return compareNumeric(max1, max2, false);
            })(), // Higher is better
        },
        waitingPeriod: {
            policy1: summary1.waitingPeriod,
            policy2: summary2.waitingPeriod,
            comparison: compareWaitingPeriods(),
        },
        coverageTypes: {
            policy1: summary1.coverageTypes ?? null,
            policy2: summary2.coverageTypes ?? null,
            comparison: compareArrays(summary1.coverageTypes, summary2.coverageTypes),
        },
        exclusions: {
            policy1: summary1.exclusions ?? null,
            policy2: summary2.exclusions ?? null,
            comparison: compareArrays(summary1.exclusions, summary2.exclusions),
        },
    };
}
/**
 * Generate formatted comparison text for chat display
 * @param structuredComparison - Structured comparison data
 * @param languageComparison - Language comparison results
 * @param policy1Name - Name of first policy
 * @param policy2Name - Name of second policy
 * @returns Formatted text summary
 */
function formatComparisonText(structuredComparison, languageComparison, policy1Name, policy2Name) {
    const sections = [];
    sections.push(`Here's a comparison of **${policy1Name}** and **${policy2Name}**:\n`);
    // Add structured comparison highlights
    const highlights = [];
    if (structuredComparison.deductible.comparison === 'policy1_better') {
        highlights.push(`- ${policy1Name} has a lower deductible`);
    }
    else if (structuredComparison.deductible.comparison === 'policy2_better') {
        highlights.push(`- ${policy2Name} has a lower deductible`);
    }
    if (structuredComparison.reimbursementRate.comparison === 'policy1_better') {
        highlights.push(`- ${policy1Name} has a higher reimbursement rate`);
    }
    else if (structuredComparison.reimbursementRate.comparison === 'policy2_better') {
        highlights.push(`- ${policy2Name} has a higher reimbursement rate`);
    }
    if (highlights.length > 0) {
        sections.push('**Key Differences:**\n' + highlights.join('\n'));
    }
    // Add language comparison insights
    if (languageComparison.length > 0) {
        sections.push('\n**Language Analysis:**');
        for (const comparison of languageComparison.slice(0, 3)) {
            // Show top 3 topics
            sections.push(`\n**${comparison.topic}**: ${comparison.overallComparison}`);
        }
    }
    return sections.join('\n');
}
/**
 * Generate full comparison between two policies
 * Combines structured comparison and language analysis
 * @param policy1Id - First policy ID
 * @param policy2Id - Second policy ID
 * @param policy1Summary - First policy summary
 * @param policy2Summary - Second policy summary
 * @param policy1Name - Name of first policy
 * @param policy2Name - Name of second policy
 * @returns Full comparison result
 */
async function generateFullComparison(policy1Id, policy2Id, policy1Summary, policy2Summary, policy1Name, policy2Name) {
    // Run structured comparison (synchronous)
    const structuredComparison = comparePolicySummaries(policy1Summary, policy2Summary);
    // Run language comparison for all topics (async, may take time)
    const languageComparison = await compareAllTopics(policy1Id, policy2Id);
    // Format text for chat display
    const formattedText = formatComparisonText(structuredComparison, languageComparison, policy1Name, policy2Name);
    return {
        structuredComparison,
        languageComparison,
        formattedText,
    };
}
//# sourceMappingURL=policyComparisonService.js.map