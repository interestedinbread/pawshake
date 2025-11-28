import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { policyApi } from '../api/policyApi';
import { SelectTwoPolicies } from '../components/policy/SelectTwoPolicies';
import { ChatHistory, type ChatMessage } from '../components/qa/ChatHistory';
import { ChatInput } from '../components/qa/ChatInput';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { ApiError } from '../api/apiClient';

export function ComparePoliciesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policyId1 = searchParams.get('policyId1');
  const policyId2 = searchParams.get('policyId2');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async (question: string) => {
    if (!policyId1 || !policyId2) {
      setError('Please select two policies first');
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add loading assistant message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await policyApi.askComparisonQuestion(policyId1, policyId2, question);

      // Replace loading message with actual response
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex((msg) => msg.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.answer,
            timestamp: new Date(),
          };
        }
        return newMessages;
      });
    } catch (err) {
      // Remove loading message and show error
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      const statusCode = err instanceof ApiError ? err.statusCode : undefined;
      const errorMessage = getUserFriendlyErrorMessage(
        err,
        statusCode,
        { action: 'compare policies', resource: 'comparison' }
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!policyId1 || !policyId2) {
    // No policy IDs in URL: let the user choose two policies first
    return (
      <SelectTwoPolicies
        onSelect={(id1, id2) => {
          navigate(
            `/compare?policyId1=${encodeURIComponent(id1)}&policyId2=${encodeURIComponent(id2)}`
          );
        }}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col rounded-2xl border shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Compare policies</h1>
        <p className="mt-1 text-sm text-[var(--color-dark-text-secondary)]">
          Ask questions to compare your two selected policies side by side.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border p-3 text-sm border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]">
          {error}
        </div>
      )}

      {/* Chat history */}
      <div className="flex-1 overflow-hidden">
        <ChatHistory messages={messages} maxMessages={100} />
      </div>

      {/* Chat input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <ChatInput
          onSubmit={handleAskQuestion}
          isLoading={isLoading}
          disabled={!policyId1 || !policyId2}
          placeholder="Ask a question to compare the two policies..."
        />
      </div>
    </div>
  );
}

