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
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: '✓',
    };
  }
  if (status === 'partial') {
    return {
      label: 'Partially Covered',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: '⚠',
    };
  }
  if (status === 'unclear') {
    return {
      label: 'Coverage Unclear',
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      icon: '?',
    };
  }
  // status === false
  return {
    label: 'Not Covered',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
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
    <div className={`rounded-xl border-2 ${statusDisplay.borderColor} ${statusDisplay.bgColor} p-6 shadow-sm`}>
      {/* Header with status and confidence */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${statusDisplay.bgColor} ${statusDisplay.color} border-2 ${statusDisplay.borderColor} text-2xl font-bold`}
          >
            {statusDisplay.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{statusDisplay.label}</h3>
            <p className="text-sm text-slate-600">Coverage determination</p>
          </div>
        </div>
        <ConfidenceBadge level={confidence} />
      </div>

      {/* Coverage details */}
      <div className="space-y-4">
        {/* Covered aspects */}
        {coverageDetails.coveredAspects.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Covered aspects:</p>
            <ul className="space-y-1">
              {coverageDetails.coveredAspects.map((aspect, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Excluded aspects */}
        {coverageDetails.excludedAspects && coverageDetails.excludedAspects.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Excluded aspects:</p>
            <ul className="space-y-1">
              {coverageDetails.excludedAspects.map((aspect, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-rose-600">✗</span>
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Important notes */}
        <div className="flex flex-wrap gap-3">
          {coverageDetails.waitingPeriodApplies && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              <span>⏱</span>
              Waiting period applies
            </span>
          )}
          {coverageDetails.deductibleApplies && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              <span>💰</span>
              Deductible applies
            </span>
          )}
        </div>

        {/* Estimated coverage */}
        {estimatedCoverage && (
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-sm font-medium text-slate-700">Estimated reimbursement:</p>
            {estimatedCoverage.percentage !== undefined ? (
              <p className="mt-1 text-2xl font-bold text-slate-900">{estimatedCoverage.percentage}%</p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">See policy details</p>
            )}
            {estimatedCoverage.notes && (
              <p className="mt-1 text-xs text-slate-600">{estimatedCoverage.notes}</p>
            )}
          </div>
        )}

        {/* Additional notes */}
        {coverageDetails.notes && (
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-xs text-slate-600">{coverageDetails.notes}</p>
          </div>
        )}

        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="mb-2 text-sm font-medium text-amber-800">Important warnings:</p>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
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

