"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerQuestion = answerQuestion;
const openai_1 = require("@langchain/openai");
const vectorService_1 = require("./vectorService");
// Initialize OpenAI chat model
const openAIApiKey = process.env.OPENAI_API_KEY;
if (!openAIApiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables');
}
const chatModel = new openai_1.ChatOpenAI({
    openAIApiKey: openAIApiKey,
    modelName: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can upgrade to gpt-4o if needed
    temperature: 0.3, // Lower temperature for more factual, consistent answers
});
/**
 * Generate an answer to a user's question using RAG (Retrieval-Augmented Generation)
 * @param question - User's question about their policy
 * @param documentId - Optional: filter to a specific document
 * @param policyId - Optional: filter to a specific policy bundle
 * @param nResults - Number of similar chunks to retrieve (default 5)
 * @returns Answer with source citations
 */
async function answerQuestion(question, documentId, policyId, nResults = 5) {
    try {
        // Validate input
        if (!question || question.trim().length === 0) {
            throw new Error('Question is required');
        }
        // Step 1: Retrieve relevant chunks from vector database
        const relevantChunks = await (0, vectorService_1.querySimilarChunks)(question, nResults, documentId, policyId);
        if (relevantChunks.length === 0) {
            return {
                answer: "I couldn't find any relevant information in your policy documents to answer this question. Please make sure you have uploaded your policy document and try rephrasing your question.",
                sources: [],
            };
        }
        // Step 2: Build context from retrieved chunks (for LLM)
        // Include page numbers so LLM can reference them
        const context = relevantChunks
            .map((chunk, index) => {
            const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
            return `[Source ${index + 1}${pageInfo}]:\n${chunk.text}`;
        })
            .join('\n\n---\n\n');
        // Step 3: Build system prompt with instructions to include page references
        const systemPrompt = `You are a helpful assistant that answers questions about pet insurance policies. 
Your answers should be:
- Accurate and based only on the provided policy context
- Clear and easy to understand
- Include specific details like dollar amounts, percentages, and time periods when available

IMPORTANT: At the end of your answer, add a brief note suggesting which page(s) the user should refer to for more details. 
For example: "For more details, refer to page X of your policy document" or "This information can be found on page X."
Use the page numbers from the sources provided in the context. If multiple pages are relevant, mention the most important one or two.

If the provided context doesn't contain enough information to fully answer the question, say so honestly.
Do not make up information that isn't in the provided context.

Policy Context:
${context}`;
        // Step 4: Generate answer using ChatOpenAI
        const response = await chatModel.invoke([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
        ]);
        const answer = response.content;
        // Step 5: Return answer without text citations (LLM includes page references in answer)
        return {
            answer,
            sources: [], // No longer returning text citations
        };
    }
    catch (error) {
        throw new Error(`Failed to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=qaService.js.map