import { ConfidenceBadge } from '../policy/ConfidenceBadge';
import type { CoverageStatus, ConfidenceLevel, CoverageDetails, EstimatedCoverage } from '../../api/coverageApi';

interface CoverageStatusCardProps {
  isCovered: CoverageStatus;
  confidence: ConfidenceLevel;
  coverageDetails: CoverageDetails;
  estimatedCoverage?: EstimatedCoverage;
  warnings?: string[];
}

const getCoverageStatusDisplay = (status: CoverageStatus): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
} => {
  if (status === true) {
    return {
      label: 'Covered',
      color: '#6ee7b7',
      bgColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
      icon: '✓',
    };
  }
  if (status === 'partial') {
    return {
      label: 'Partially Covered',
      color: '#fbbf24',
      bgColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 0.5)',
      icon: '⚠',
    };
  }
  if (status === 'unclear') {
    return {
      label: 'Coverage Unclear',
      color: 'var(--color-dark-text-secondary)',
      bgColor: 'rgba(148, 163, 184, 0.2)',
      borderColor: 'var(--color-dark-border)',
      icon: '?',
    };
  }
  // status === false
  return {
    label: 'Not Covered',
    color: '#fca5a5',
    bgColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    icon: '✗',
  };
};

export function CoverageStatusCard({
  isCovered,
  confidence,
  coverageDetails,
  estimatedCoverage,
  warnings,
}: CoverageStatusCardProps) {
  const statusDisplay = getCoverageStatusDisplay(isCovered);

  return (
    <div className="rounded-xl border-2 p-6 shadow-sm" style={{ backgroundColor: statusDisplay.bgColor, borderColor: statusDisplay.borderColor }}>
      {/* Header with status and confidence */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-2xl font-bold"
            style={{ backgroundColor: statusDisplay.bgColor, color: statusDisplay.color, borderColor: statusDisplay.borderColor }}
          >
            {statusDisplay.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">{statusDisplay.label}</h3>
            <p className="text-sm text-[var(--color-dark-text-secondary)]">Coverage determination</p>
          </div>
        </div>
        <ConfidenceBadge level={confidence} />
      </div>

      {/* Coverage details */}
      <div className="space-y-4">
        {/* Covered aspects */}
        {coverageDetails.coveredAspects.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-dark-text-primary)]">Covered aspects:</p>
            <ul className="space-y-1">
              {coverageDetails.coveredAspects.map((aspect, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[var(--color-dark-text-secondary)]">
                  <span className="mt-0.5 text-[#6ee7b7]">✓</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Excluded aspects */}
        {coverageDetails.excludedAspects && coverageDetails.excludedAspects.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-dark-text-primary)]">Excluded aspects:</p>
            <ul className="space-y-1">
              {coverageDetails.excludedAspects.map((aspect, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[var(--color-dark-text-secondary)]">
                  <span className="mt-0.5 text-[#fca5a5]">✗</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Important notes */}
        <div className="flex flex-wrap gap-3">
          {coverageDetails.waitingPeriodApplies && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-[rgba(245,158,11,0.2)] text-[#fbbf24]">
              <span>⏱</span>
              Waiting period applies
            </span>
          )}
          {coverageDetails.deductibleApplies && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-[rgba(59,130,246,0.2)] text-[#93c5fd]">
              <span>💰</span>
              Deductible applies
            </span>
          )}
        </div>

        {/* Estimated coverage */}
        {estimatedCoverage && (
          <div className="rounded-lg p-3 bg-[var(--color-dark-card)]">
            <p className="text-sm font-medium text-[var(--color-dark-text-primary)]">Estimated reimbursement:</p>
            {estimatedCoverage.percentage !== undefined ? (
              <p className="mt-1 text-2xl font-bold text-[var(--color-dark-text-primary)]">{estimatedCoverage.percentage}%</p>
            ) : (
              <p className="mt-1 text-sm text-[var(--color-dark-text-secondary)]">See policy details</p>
            )}
            {estimatedCoverage.notes && (
              <p className="mt-1 text-xs text-[var(--color-dark-text-secondary)]">{estimatedCoverage.notes}</p>
            )}
          </div>
        )}

        {/* Additional notes */}
        {coverageDetails.notes && (
          <div className="rounded-lg p-3 bg-[var(--color-dark-card)]">
            <p className="text-xs text-[var(--color-dark-text-secondary)]">{coverageDetails.notes}</p>
          </div>
        )}

        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="rounded-lg border p-3 border-[rgba(245,158,11,0.5)] bg-[rgba(245,158,11,0.15)]">
            <p className="mb-2 text-sm font-medium text-[#fbbf24]">Important warnings:</p>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#fcd34d]">
                  <span className="mt-0.5">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

