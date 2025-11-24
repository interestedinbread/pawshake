import { Link } from 'react-router-dom';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: never; // Citations removed - LLM includes page references in answer
  timestamp?: Date | string;
  isLoading?: boolean;
  suggestCoverageCheck?: boolean;
  originalQuestion?: string;
  policyId?: string;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isLoading = false,
  suggestCoverageCheck = false,
  originalQuestion,
  policyId,
}: MessageBubbleProps) {

  const isUser = role === 'user';
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-start">
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

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] space-y-1">
          <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
          </div>
          {formattedTime && (
            <p className="text-right text-xs text-slate-500">{formattedTime}</p>
          )}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">{content}</p>
        </div>

        {/* Coverage check suggestion link */}
        {suggestCoverageCheck && originalQuestion && policyId && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <p className="mb-2 text-xs font-medium text-blue-900">
              💡 Get a detailed coverage checklist
            </p>
            <Link
              to={`/coverage-check?policyId=${encodeURIComponent(policyId)}&question=${encodeURIComponent(originalQuestion)}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Check coverage details →
            </Link>
          </div>
        )}

        {formattedTime && (
          <p className="text-left text-xs text-slate-500">{formattedTime}</p>
        )}
      </div>
    </div>
  );
}

