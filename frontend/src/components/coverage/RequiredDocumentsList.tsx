import { useState } from 'react';
import type { RequiredDocument } from '../../api/coverageApi';

interface RequiredDocumentsListProps {
  documents: RequiredDocument[];
}

export function RequiredDocumentsList({ documents }: RequiredDocumentsListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Required documents</h2>
          <p className="text-sm text-[var(--color-dark-text-secondary)]">Documents needed to file your claim.</p>
        </header>
        <p className="text-sm text-[var(--color-dark-text-muted)]">No documents required at this time.</p>
      </div>
    );
  }

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="rounded-xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Required documents</h2>
        <p className="text-sm text-[var(--color-dark-text-secondary)]">
          {documents.length} document{documents.length === 1 ? '' : 's'} needed to file your claim.
        </p>
      </header>

      <div className="space-y-3">
        {documents.map((document, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className="rounded-lg border transition-colors bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]"
            >
              {/* Document header - always visible */}
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-4 py-3 text-left"
                type="button"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(59,130,246,0.2)] text-[#93c5fd]">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--color-dark-text-primary)]">{document.documentType}</h3>
                      {document.deadline && (
                        <p className="text-xs text-[#fbbf24]">Deadline: {document.deadline}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.deadline && (
                      <span className="rounded-full px-2 py-1 text-xs font-medium bg-[rgba(245,158,11,0.2)] text-[#fbbf24]">
                        ⏱ Due
                      </span>
                    )}
                    <svg
                      className={`h-5 w-5 text-[var(--color-dark-text-muted)] transition-transform ${
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
                <div className="border-t px-4 py-3 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
                  <div className="space-y-3">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-dark-text-muted)]">
                        What to include
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-dark-text-secondary)]">{document.description}</p>
                    </div>

                    {/* Why required */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-dark-text-muted)]">
                        Why this is needed
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-dark-text-secondary)]">{document.whyRequired}</p>
                    </div>

                    {/* Deadline (if not shown in header) */}
                    {document.deadline && (
                      <div className="rounded-lg border p-2 bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.5)]">
                        <p className="text-xs font-medium text-[#fbbf24]">
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

