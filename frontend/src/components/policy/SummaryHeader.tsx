import { Button } from '../common/Button';
import { ConfidenceBadge } from './ConfidenceBadge';

interface SummaryHeaderProps {
  planName?: string | null;
  insurer?: string | null;
  policyNumber?: string | null;
  lastUpdated?: string | null;
  confidence?: 'high' | 'medium' | 'low' | null;
  onRefresh?: () => void;
  onDownload?: () => void;
  isRefreshing?: boolean;
}

export function SummaryHeader({
  planName,
  insurer,
  policyNumber,
  lastUpdated,
  confidence,
  onRefresh,
  isRefreshing = false,
}: SummaryHeaderProps) {
  const displayPlan = planName || 'Policy summary';
  const displayInsurer = insurer || 'Insurer unknown';
  const displayPolicyNumber = policyNumber || 'Unknown policy number';

  return (
    <header className="rounded-2xl border p-6 shadow-lg bg-gradient-to-r from-[var(--color-primary)]/10 via-[var(--color-dark-surface)] to-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-primary)]">Policy summary</p>
          <h1 className="mt-1 text-4xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">{displayPlan}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--color-dark-text-secondary)]">
            <span>{displayInsurer}</span>
            <span className="hidden text-[var(--color-dark-border)] sm:inline">•</span>
            <span>{displayPolicyNumber}</span>
          </div>
          {lastUpdated && (
            <p className="mt-2 text-xs text-[var(--color-dark-text-muted)]">Last extracted {new Date(lastUpdated).toLocaleString()}</p>
          )}
        </div>

        <div className="flex flex-col-reverse items-start gap-3 lg:flex-row lg:items-center">
          <ConfidenceBadge level={confidence} />
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={!onRefresh}
              isLoading={isRefreshing}
            >
              Refresh summary
            </Button>
            
          </div>
        </div>
      </div>
    </header>
  );
}
