import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

interface ActionItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  variant: 'primary' | 'outline';
}

const actions: ActionItem[] = [
  {
    title: 'Upload new policy',
    description: 'Import a PDF to extract a summary, answer questions, and prepare a claim.',
    icon: '📤',
    route: '/upload',
    variant: 'primary',
  },
  {
    title: 'Review summaries',
    description: 'See your policy extractions.',
    icon: '📝',
    route: '/summary',
    variant: 'outline',
  },
  {
    title: 'Ask a coverage question',
    description: 'Use an agent to clarify what is covered before filing a claim.',
    icon: '💬',
    route: '/qa',
    variant: 'outline',
  },
  {
    title: 'Compare policies',
    description: 'Ask questions to compare the advantages and disadvantages of two policies.',
    icon: '⚖️',
    route: '/compare',
    variant: 'outline',
  },
  {
    title: 'Create claim checklist',
    description: 'Describe an incident and generate a checklist with required documents and action steps.',
    icon: "📋",
    route: '/claim-checklist',
    variant: 'outline'
  }
];

export function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Quick actions</h3>
          <p className="text-sm text-[var(--color-dark-text-secondary)]">
            Shortcuts to the most common workflows.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map(({ title, description, icon, route, variant }) => (
          <div
            key={title}
            className="flex flex-col justify-between rounded-xl border p-4 transition-colors bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-[var(--color-primary)]"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl bg-[rgba(244,162,97,0.15)]">
                {icon}
              </span>
              <div>
                <p className="text-base font-semibold text-[var(--color-dark-text-primary)]">{title}</p>
                <p className="text-sm text-[var(--color-dark-text-secondary)]">{description}</p>
              </div>
            </div>
            <Button
              variant={variant}
              size="sm"
              onClick={() => navigate(route)}
            >
              Go
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
