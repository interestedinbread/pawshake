import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';

export function WelcomeCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userName = useMemo(() => {
    if (!user?.email) return 'there';
    const [namePart] = user.email.split('@');
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }, [user?.email]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
            Welcome back
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">
            Hi {userName}! 👋
          </h2>
          <p className="max-w-xl text-base text-slate-600">
            Upload a new policy, review your extracted summaries, or ask a coverage question.
            We&apos;ll surface the key details you need to file claims confidently.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/upload')}
            >
              Upload a policy
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/qa')}
            >
              Ask a question
            </Button>
          </div>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-500">Policies uploaded</p>
            <p className="text-2xl font-semibold text-slate-900">—</p>
            <p className="text-xs text-slate-400">Track how many policies you&apos;ve imported.</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Pending claims</p>
            <p className="text-2xl font-semibold text-slate-900">—</p>
            <p className="text-xs text-slate-400">Coming soon: monitor claim filing status.</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Confidence alerts</p>
            <p className="text-2xl font-semibold text-slate-900">—</p>
            <p className="text-xs text-slate-400">Improve low-confidence fields quickly.</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Latest Q&A</p>
            <p className="text-2xl font-semibold text-slate-900">—</p>
            <p className="text-xs text-slate-400">See the most recent coverage questions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
