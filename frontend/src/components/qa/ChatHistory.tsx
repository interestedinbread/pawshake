import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { SourceCitation } from '../../api/qaApi';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  timestamp: Date | string;
  isLoading?: boolean;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  maxMessages?: number; // Optional limit on number of messages to display
}

export function ChatHistory({ messages, maxMessages }: ChatHistoryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Limit messages to last N if maxMessages is specified
  const displayedMessages = maxMessages
    ? messages.slice(-maxMessages)
    : messages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [displayedMessages]);

  if (displayedMessages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600">No messages yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Ask a question about your policy to get started.
          </p>
        </div>
      </div>
    );
  }

  const hasMoreMessages = maxMessages && messages.length > maxMessages;

  return (
    <div
      ref={scrollContainerRef}
      className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-6"
    >
      {hasMoreMessages && (
        <div className="text-center text-sm text-slate-500">
          <p>Showing last {maxMessages} of {messages.length} messages</p>
        </div>
      )}
      {displayedMessages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
          sources={message.sources}
          timestamp={message.timestamp}
          isLoading={message.isLoading}
        />
      ))}
    </div>
  );
}

