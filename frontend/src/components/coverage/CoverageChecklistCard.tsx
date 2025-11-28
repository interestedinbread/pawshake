import type { CoverageChecklist } from '../../api/coverageApi';
import { CoverageStatusCard } from './CoverageStatusCard';
import { RequiredDocumentsList } from './RequiredDocumentsList';
import { ActionStepsList } from './ActionStepsList';

interface CoverageChecklistCardProps {
  checklist: CoverageChecklist;
}

export function CoverageChecklistCard({ checklist }: CoverageChecklistCardProps) {
  return (
    <div className="space-y-6">
      {/* Summary section */}
      {checklist.summary && (
        <div className="rounded-xl border p-4 border-[rgba(59,130,246,0.5)] bg-[rgba(59,130,246,0.15)]">
          <p className="text-sm text-[var(--color-dark-text-secondary)]">{checklist.summary}</p>
        </div>
      )}

      {/* Coverage status */}
      <CoverageStatusCard
        isCovered={checklist.isCovered}
        confidence={checklist.confidence}
        coverageDetails={checklist.coverageDetails}
        estimatedCoverage={checklist.estimatedCoverage}
        warnings={checklist.warnings}
      />

      {/* Required documents */}
      <RequiredDocumentsList documents={checklist.requiredDocuments} />

      {/* Action steps */}
      <ActionStepsList steps={checklist.actionSteps} />
    </div>
  );
}

