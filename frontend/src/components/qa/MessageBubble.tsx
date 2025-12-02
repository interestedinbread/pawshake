interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: never; // Citations removed - LLM includes page references in answer
  timestamp?: Date | string;
  isLoading?: boolean;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  isLoading = false,
}: MessageBubbleProps) {

  const isUser = role === 'user';
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  if (isLoading) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[var(--color-dark-card)] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-dark-text-muted)]" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-dark-text-muted)] [animation-delay:0.2s]" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-dark-text-muted)] [animation-delay:0.4s]" />
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
            <p className="text-right text-xs text-[var(--color-dark-text-muted)]">{formattedTime}</p>
          )}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] space-y-1">
        <div className="rounded-2xl rounded-tl-sm border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] px-4 py-3 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-dark-text-primary)]">{content}</p>
        </div>
        {formattedTime && (
          <p className="text-left text-xs text-[var(--color-dark-text-muted)]">{formattedTime}</p>
        )}
      </div>
    </div>
  );
}

