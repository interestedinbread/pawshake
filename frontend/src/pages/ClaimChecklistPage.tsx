import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { coverageApi, type CoverageChecklist } from '../api/coverageApi';
import { SelectPolicy } from '../components/policy/SelectPolicy';
import type { ChatMessage } from '../components/qa/ChatHistory';
import { ChatInput } from '../components/qa/ChatInput';
import { CoverageChecklistCard } from '../components/coverage/CoverageChecklistCard';

// Extended message type for claim checklist page
interface ClaimChecklistChatMessage extends ChatMessage {
  checklist?: CoverageChecklist;
}

export function ClaimChecklistPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policyId = searchParams.get('policyId');
  const prefillQuestion = searchParams.get('question'); // For navigation from Q&A

  const [messages, setMessages] = useState<ClaimChecklistChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill question if coming from Q&A page
  const [initialQuestion] = useState<string | null>(prefillQuestion);

  const handleCheckCoverage = async (incidentDescription: string) => {
    if (!policyId) {
      setError('Please select a policy first');
      return;
    }

    // Add user message immediately
    const userMessage: ClaimChecklistChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: incidentDescription,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Add loading assistant message
    const loadingMessage: ClaimChecklistChatMessage = {
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
      const checklist = await coverageApi.checkCoverage(policyId, incidentDescription);

      // Replace loading message with actual response
      setMessages((prev) => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.findIndex((msg) => msg.isLoading);
        if (loadingIndex !== -1) {
          newMessages[loadingIndex] = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: checklist.summary, // Use summary as the text content
            timestamp: new Date(),
            checklist, // Embed the full checklist
          };
        }
        return newMessages;
      });
    } catch (err) {
      // Remove loading message and show error
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to analyze coverage. Please try again.';
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
          const params = new URLSearchParams({ policyId: id });
          if (prefillQuestion) {
            params.set('question', prefillQuestion);
          }
          navigate(`/claim-checklist?${params.toString()}`);
        }}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-900">Claim Checklist</h1>
        <p className="mt-1 text-sm text-slate-600">
          Describe an incident to get a detailed checklist with required documents and action steps.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Chat history with embedded checklist cards */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-slate-600">No checklists yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Describe an incident to get a claim checklist.
                </p>
                {initialQuestion && (
                  <button
                    onClick={() => handleCheckCoverage(initialQuestion)}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create checklist: &quot;{initialQuestion}&quot;
                  </button>
                )}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              if (message.isLoading) {
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:0.2s]" />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                );
              }

              if (message.role === 'user') {
                const formattedTime = message.timestamp
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : null;
                return (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[80%] space-y-1">
                      <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      {formattedTime && (
                        <p className="text-right text-xs text-slate-500">{formattedTime}</p>
                      )}
                    </div>
                  </div>
                );
              }

              // Assistant message with optional checklist
              const formattedTime = message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[90%] space-y-3">
                    {/* Text summary */}
                    {message.content && (
                      <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                          {message.content}
                        </p>
                      </div>
                    )}

                    {/* Embedded checklist card */}
                    {message.checklist && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                        <CoverageChecklistCard checklist={message.checklist} />
                      </div>
                    )}

                    {formattedTime && (
                      <p className="text-left text-xs text-slate-500">{formattedTime}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <ChatInput
          onSubmit={handleCheckCoverage}
          isLoading={isLoading}
          disabled={!policyId}
          placeholder="Describe the incident (e.g., 'My dog broke his leg playing fetch')..."
        />
      </div>
    </div>
  );
}

