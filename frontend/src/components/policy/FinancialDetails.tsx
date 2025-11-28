import { EditableField } from './EditableField';
import { SourceCitation } from './SourceCitation';
import { ConfidenceBadge } from './ConfidenceBadge';

interface FinancialDetailsProps {
  reimbursementRate?: number | null;
  deductible?: {
    amount?: number | null;
    type?: string | null;
    appliesTo?: string | null;
    confidence?: 'high' | 'medium' | 'low' | null;
    sources?: Array<{ textSnippet?: string; pageNumber?: number }>; 
  } | null;
  annualMaximum?: number | 'unlimited' | null;
  perIncidentMaximum?: number | 'unlimited' | null;
  confidence?: {
    reimbursementRate?: 'high' | 'medium' | 'low' | null;
    annualMaximum?: 'high' | 'medium' | 'low' | null;
    perIncidentMaximum?: 'high' | 'medium' | 'low' | null;
  };
  sources?: {
    reimbursementRate?: Array<{ textSnippet?: string; pageNumber?: number }>;
    annualMaximum?: Array<{ textSnippet?: string; pageNumber?: number }>;
    perIncidentMaximum?: Array<{ textSnippet?: string; pageNumber?: number }>;
  };
  onEdit?: (field: string, value: unknown) => void;
}

function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Unknown';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMaximum(value?: number | 'unlimited' | null): string {
  if (value === 'unlimited') {
    return 'Unlimited';
  }
  if (value === null || value === undefined) {
    return 'Unknown';
  }
  return formatCurrency(value);
}

export function FinancialDetails({
  reimbursementRate,
  deductible,
  annualMaximum,
  perIncidentMaximum,
  confidence,
  sources,
  onEdit,
}: FinancialDetailsProps) {
  return (
    <section className="rounded-2xl border p-6 shadow-lg bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-dark-surface)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/50 transition-colors">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">Financial coverage</h2>
          <p className="text-sm text-[var(--color-dark-text-secondary)] mt-1">Key policy limits and reimbursement information.</p>
        </div>
        {confidence?.annualMaximum && <ConfidenceBadge level={confidence.annualMaximum} />}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-5 bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Deductible</h3>
            {deductible?.confidence && <ConfidenceBadge level={deductible.confidence} />}
          </div>
          <EditableField
            label="Amount"
            value={deductible?.amount !== undefined && deductible?.amount !== null ? formatCurrency(deductible.amount) : 'Unknown'}
            onEdit={onEdit ? (value) => onEdit('deductible.amount', value) : undefined}
            highlight
          />
          <EditableField
            label="Type"
            value={deductible?.type || 'Unknown'}
            onEdit={onEdit ? (value) => onEdit('deductible.type', value) : undefined}
          />
          <EditableField
            label="Applies to"
            value={deductible?.appliesTo || 'Unknown'}
            onEdit={onEdit ? (value) => onEdit('deductible.appliesTo', value) : undefined}
          />
          {deductible?.sources && deductible.sources.length > 0 && (
            <SourceCitation sources={deductible.sources} />
          )}
        </div>

        <div className="space-y-5 rounded-xl border p-5 bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Reimbursement rate</h3>
              {confidence?.reimbursementRate && <ConfidenceBadge level={confidence.reimbursementRate} />}
            </div>
            <EditableField
              value={
                reimbursementRate !== null && reimbursementRate !== undefined
                  ? `${reimbursementRate}%`
                  : 'Unknown'
              }
              onEdit={onEdit ? (value) => onEdit('reimbursementRate', value) : undefined}
              highlight
            />
            {sources?.reimbursementRate && sources.reimbursementRate.length > 0 && (
              <SourceCitation sources={sources.reimbursementRate} />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Annual maximum</h3>
              {confidence?.annualMaximum && <ConfidenceBadge level={confidence.annualMaximum} />}
            </div>
            <EditableField
              value={formatMaximum(annualMaximum)}
              onEdit={onEdit ? (value) => onEdit('annualMaximum', value) : undefined}
              highlight
            />
            {sources?.annualMaximum && sources.annualMaximum.length > 0 && (
              <SourceCitation sources={sources.annualMaximum} />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">Per incident maximum</h3>
              {confidence?.perIncidentMaximum && <ConfidenceBadge level={confidence.perIncidentMaximum} />}
            </div>
            <EditableField
              value={formatMaximum(perIncidentMaximum)}
              onEdit={onEdit ? (value) => onEdit('perIncidentMaximum', value) : undefined}
              highlight
            />
            {sources?.perIncidentMaximum && sources.perIncidentMaximum.length > 0 && (
              <SourceCitation sources={sources.perIncidentMaximum} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
