import type { ReactNode } from 'react';
import { EditableField } from './EditableField';
import { SourceCitation } from './SourceCitation';
import { ConfidenceBadge } from './ConfidenceBadge';

interface CoverageDetailsProps {
  coverageTypes?: string[] | null;
  exclusions?: string[] | null;
  notes?: string | null;
  confidence?: {
    coverageTypes?: 'high' | 'medium' | 'low' | null;
    exclusions?: 'high' | 'medium' | 'low' | null;
    notes?: 'high' | 'medium' | 'low' | null;
  };
  sources?: {
    coverageTypes?: Array<{ textSnippet?: string; pageNumber?: number }>;
    exclusions?: Array<{ textSnippet?: string; pageNumber?: number }>;
    notes?: Array<{ textSnippet?: string; pageNumber?: number }>;
  };
  onEdit?: (field: string, value: string) => void;
}

function renderList(items?: string[] | null): ReactNode {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[var(--color-dark-text-muted)]">No items noted.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-dark-text-secondary)]">
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  );
}

export function CoverageDetails({
  coverageTypes,
  exclusions,
  notes,
  confidence,
  sources,
  onEdit,
}: CoverageDetailsProps) {
  return (
    <section className="rounded-2xl border p-6 shadow-lg bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-dark-surface)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/50 transition-colors">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">Coverage overview</h2>
        <p className="text-sm text-[var(--color-dark-text-secondary)] mt-1">What the policy explicitly covers and excludes.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-5 bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Coverage types</h3>
            {confidence?.coverageTypes && <ConfidenceBadge level={confidence.coverageTypes} />}
          </div>
          {renderList(coverageTypes)}
          {sources?.coverageTypes && sources.coverageTypes.length > 0 && (
            <SourceCitation sources={sources.coverageTypes} />
          )}
        </div>

        <div className="space-y-4 rounded-xl border p-5 bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Exclusions</h3>
            {confidence?.exclusions && <ConfidenceBadge level={confidence.exclusions} />}
          </div>
          {renderList(exclusions)}
          {sources?.exclusions && sources.exclusions.length > 0 && (
            <SourceCitation sources={sources.exclusions} />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border p-5 bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Additional notes</h3>
          {confidence?.notes && <ConfidenceBadge level={confidence.notes} />}
        </div>
        <EditableField
          value={notes || 'No additional notes.'}
          onEdit={onEdit ? (value) => onEdit('notes', value) : undefined}
        />
        {sources?.notes && sources.notes.length > 0 && (
          <SourceCitation sources={sources.notes} />
        )}
      </div>
    </section>
  );
}
