import { useState } from 'react';
import type { RequiredDocument } from '../../api/coverageApi';

interface RequiredDocumentsListProps {
  documents: RequiredDocument[];
}

export function RequiredDocumentsList({ documents }: RequiredDocumentsListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Required documents</h2>
          <p className="text-sm text-slate-600">Documents needed to file your claim.</p>
        </header>
        <p className="text-sm text-slate-500">No documents required at this time.</p>
      </div>
    );
  }

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Required documents</h2>
        <p className="text-sm text-slate-600">
          {documents.length} document{documents.length === 1 ? '' : 's'} needed to file your claim.
        </p>
      </header>

      <div className="space-y-3">
        {documents.map((document, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-slate-50 transition-colors hover:border-blue-200 hover:bg-blue-50/50"
            >
              {/* Document header - always visible */}
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-4 py-3 text-left"
                type="button"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{document.documentType}</h3>
                      {document.deadline && (
                        <p className="text-xs text-amber-600">Deadline: {document.deadline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.deadline && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                        ⏱ Due
                      </span>
                    )}
                    <svg
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expandable content */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-white px-4 py-3">
                  <div className="space-y-3">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        What to include
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{document.description}</p>
                    </div>

                    {/* Why required */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Why this is needed
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{document.whyRequired}</p>
                    </div>

                    {/* Deadline (if not shown in header) */}
                    {document.deadline && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                        <p className="text-xs font-medium text-amber-800">
                          ⏱ Deadline: {document.deadline}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

