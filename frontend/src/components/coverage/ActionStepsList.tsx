import type { ActionStep } from '../../api/coverageApi';

interface ActionStepsListProps {
  steps: ActionStep[];
}

const getPriorityConfig = (priority: 'high' | 'medium' | 'low'): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} => {
  switch (priority) {
    case 'high':
      return {
        label: 'High priority',
        color: '#fca5a5',
        bgColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
      };
    case 'medium':
      return {
        label: 'Medium priority',
        color: '#fbbf24',
        bgColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
      };
    case 'low':
      return {
        label: 'Low priority',
        color: '#93c5fd',
        bgColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
      };
  }
};

export function ActionStepsList({ steps }: ActionStepsListProps) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Action steps</h2>
          <p className="text-sm text-[var(--color-dark-text-secondary)]">Steps to take for your claim.</p>
        </header>
        <p className="text-sm text-[var(--color-dark-text-muted)]">No action steps required at this time.</p>
      </div>
    );
  }

  // Sort steps by step number to ensure correct order
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step);

  return (
    <div className="rounded-xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Action steps</h2>
        <p className="text-sm text-[var(--color-dark-text-secondary)]">
          {steps.length} step{steps.length === 1 ? '' : 's'} to complete for your claim.
        </p>
      </header>

      <div className="space-y-4">
        {sortedSteps.map((step, index) => {
          const priorityConfig = getPriorityConfig(step.priority);
          const isLastStep = index === sortedSteps.length - 1;

          return (
            <div key={index} className="relative">
              {/* Step connector line (not shown for last step) */}
              {!isLastStep && (
                <div className="absolute left-4 top-12 h-full w-0.5 bg-[var(--color-dark-border)]" />
              )}

              <div className="relative flex gap-4">
                {/* Step number circle */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-[var(--color-primary)] border-[var(--color-primary)] text-sm font-semibold text-[var(--color-dark-bg)]">
                  {step.step}
                </div>

                {/* Step content */}
                <div className="flex-1 rounded-lg border p-4 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="flex-1 text-base font-medium text-[var(--color-dark-text-primary)]">{step.action}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium`}
                      style={{
                        backgroundColor: priorityConfig.bgColor,
                        borderColor: priorityConfig.borderColor,
                        color: priorityConfig.color,
                      }}
                    >
                      {step.priority === 'high' && '🔴'}
                      {step.priority === 'medium' && '🟡'}
                      {step.priority === 'low' && '🔵'}
                      {priorityConfig.label}
                    </span>
                  </div>

                  {/* Additional information */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.deadline && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[rgba(245,158,11,0.2)] text-[#fbbf24]">
                        <span>⏱</span>
                        Deadline: {step.deadline}
                      </span>
                    )}
                    {step.policyReference && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-[rgba(59,130,246,0.2)] text-[#93c5fd]">
                        <span>📄</span>
                        {step.policyReference.pageNumber
                          ? `Page ${step.policyReference.pageNumber}`
                          : 'Policy reference'}
                        {step.policyReference.section && ` • ${step.policyReference.section}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

