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
    <section className="rounded-2xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-primary)]">
            Welcome back
          </p>
          <h2 className="text-3xl font-semibold text-[var(--color-dark-text-primary)]">
            Hi {userName}! 👋
          </h2>
          <p className="max-w-xl text-base text-[var(--color-dark-text-secondary)]">
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

        <div className="flex items-center justify-center lg:justify-end">
          <img 
            src="noun-paperwork.svg" 
            alt="Dog with paper" 
            className="w-full max-w-48 h-auto mr-15"
          />
        </div>
      </div>
    </section>
  );
}
