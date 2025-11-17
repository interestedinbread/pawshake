import { useState } from 'react';
import type { SourceCitation } from '../../api/qaApi';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  timestamp?: Date | string;
  isLoading?: boolean;
}

export function MessageBubble({
  role,
  content,
  sources = [],
  timestamp,
  isLoading = false,
}: MessageBubbleProps) {
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);

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

        {sources && sources.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Source references</p>
            <ul className="space-y-1.5">
              {sources.map((source, index) => {
                const expanded = expandedSourceIndex === index;

                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => setExpandedSourceIndex(expanded ? null : index)}
                      className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
                    >
                      <span>
                        {source.pageNumber ? `Page ${source.pageNumber}` : 'Source'} 
                        {source.similarity !== undefined && (
                          <span className="ml-2 text-slate-400">
                            ({Math.round((1 - source.similarity) * 100)}% match)
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400">{expanded ? 'Hide' : 'Show'} context</span>
                    </button>
                    {expanded && (
                      <div className="mt-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        {source.text || 'No text available.'}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {formattedTime && (
          <p className="text-left text-xs text-slate-500">{formattedTime}</p>
        )}
      </div>
    </div>
  );
}

