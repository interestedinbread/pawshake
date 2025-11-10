import { useState } from 'react';

interface Source {
  textSnippet?: string;
  pageNumber?: number;
}

interface SourceCitationProps {
  sources: Source[];
}

export function SourceCitation({ sources }: SourceCitationProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
      <p className="mb-2 font-medium text-slate-500">Source references</p>
      <ul className="space-y-1">
        {sources.map((source, index) => {
          const expanded = expandedIndex === index;

          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => setExpandedIndex(expanded ? null : index)}
                className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left font-medium text-slate-700 hover:border-blue-200 hover:text-blue-600"
              >
                <span>Page {source.pageNumber ?? '–'}</span>
                <span className="text-xs text-slate-400">{expanded ? 'Hide' : 'Show'} context</span>
              </button>
              {expanded && (
                <div className="mt-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-600">
                  {source.textSnippet ?? 'No snippet available.'}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
