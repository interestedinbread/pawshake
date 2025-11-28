import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { qaApi } from '../api/qaApi';
import { SelectPolicy } from '../components/policy/SelectPolicy';
import { ChatHistory, type ChatMessage } from '../components/qa/ChatHistory';
import { ChatInput } from '../components/qa/ChatInput';
import { Button } from '../components/common/Button';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { ApiError } from '../api/apiClient';

export function QAPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policyId = searchParams.get('policyId');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async (question: string) => {
    if (!policyId) {
      setError('Please select a policy first');
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
      const response = await qaApi.askQuestion(question, policyId);

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
        { action: 'get answer', resource: 'answer' }
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!policyId) {
    // No policy ID in URL: let the user choose a policy first
    return (
      <SelectPolicy
        onSelect={(id) => {
          navigate(`/qa?policyId=${encodeURIComponent(id)}`);
        }}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col rounded-2xl border shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      {/* Header */}
      <div className="border-b px-6 py-4 rounded-t-2xl bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Ask about your policy</h1>
            <p className="mt-1 text-sm text-[var(--color-dark-text-secondary)]">
              Get answers to questions about your policy coverage, limits, and more.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/claim-checklist?policyId=${encodeURIComponent(policyId)}`)}
            className="ml-4"
          >
            📋 Create Claim Checklist
          </Button>
        </div>
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
      <div className="border-t p-4 rounded-b-2xl bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
        <ChatInput onSubmit={handleAskQuestion} isLoading={isLoading} disabled={!policyId} />
      </div>
    </div>
  );
}

