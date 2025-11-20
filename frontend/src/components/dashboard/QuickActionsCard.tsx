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
    description: 'Import a PDF to extract summaries, citations, and confidence scores.',
    icon: '📤',
    route: '/upload',
    variant: 'primary',
  },
  {
    title: 'Review latest summary',
    description: 'See the most recent policy extraction and validate any low confidence fields.',
    icon: '📝',
    route: '/summary',
    variant: 'outline',
  },
  {
    title: 'Ask a coverage question',
    description: 'Use RAG to clarify what is covered before filing a claim.',
    icon: '💬',
    route: '/qa',
    variant: 'outline',
  },
];

export function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Quick actions</h3>
          <p className="text-sm text-slate-600">
            Shortcuts to the most common workflows.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map(({ title, description, icon, route, variant }) => (
          <div
            key={title}
            className="flex flex-col justify-between rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-sm"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-2xl">
                {icon}
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">{title}</p>
                <p className="text-sm text-slate-600">{description}</p>
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
