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
        color: 'text-rose-700',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      };
    case 'medium':
      return {
        label: 'Medium priority',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      };
    case 'low':
      return {
        label: 'Low priority',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
  }
};

export function ActionStepsList({ steps }: ActionStepsListProps) {
  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Action steps</h2>
          <p className="text-sm text-slate-600">Steps to take for your claim.</p>
        </header>
        <p className="text-sm text-slate-500">No action steps required at this time.</p>
      </div>
    );
  }

  // Sort steps by step number to ensure correct order
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Action steps</h2>
        <p className="text-sm text-slate-600">
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
                <div className="absolute left-4 top-12 h-full w-0.5 bg-slate-200" />
              )}

              <div className="relative flex gap-4">
                {/* Step number circle */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-sm font-semibold text-white">
                  {step.step}
                </div>

                {/* Step content */}
                <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="flex-1 text-base font-medium text-slate-900">{step.action}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border ${priorityConfig.borderColor} ${priorityConfig.bgColor} px-2.5 py-1 text-xs font-medium ${priorityConfig.color}`}
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                        <span>⏱</span>
                        Deadline: {step.deadline}
                      </span>
                    )}
                    {step.policyReference && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
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

