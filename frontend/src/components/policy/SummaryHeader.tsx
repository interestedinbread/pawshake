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
}

export function SummaryHeader({
  planName,
  insurer,
  policyNumber,
  lastUpdated,
  confidence,
  onRefresh,
  onDownload,
}: SummaryHeaderProps) {
  const displayPlan = planName || 'Policy summary';
  const displayInsurer = insurer || 'Insurer unknown';
  const displayPolicyNumber = policyNumber || 'Unknown policy number';

  return (
    <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Policy summary</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">{displayPlan}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>{displayInsurer}</span>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <span>{displayPolicyNumber}</span>
          </div>
          {lastUpdated && (
            <p className="mt-2 text-xs text-slate-500">Last extracted {new Date(lastUpdated).toLocaleString()}</p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center">
          <ConfidenceBadge level={confidence} />
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={!onRefresh}
            >
              Refresh summary
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onDownload}
              disabled={!onDownload}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
