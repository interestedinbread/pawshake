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
    <section className="rounded-2xl border p-6 shadow-sm" style={{ backgroundColor: 'var(--color-dark-surface)', borderColor: 'var(--color-dark-border)' }}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
            Welcome back
          </p>
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>
            Hi {userName}! 👋
          </h2>
          <p className="max-w-xl text-base" style={{ color: 'var(--color-dark-text-secondary)' }}>
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

        <div 
          className="grid w-full max-w-md grid-cols-2 gap-4 rounded-xl p-4 text-sm"
          style={{ backgroundColor: 'rgba(38, 70, 83, 0.3)', color: 'var(--color-dark-text-secondary)' }}
        >
          <div>
            <p className="font-medium" style={{ color: 'var(--color-dark-text-muted)' }}>Policies uploaded</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>—</p>
            <p className="text-xs" style={{ color: 'var(--color-dark-text-muted)' }}>Track how many policies you&apos;ve imported.</p>
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--color-dark-text-muted)' }}>Pending claims</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>—</p>
            <p className="text-xs" style={{ color: 'var(--color-dark-text-muted)' }}>Coming soon: monitor claim filing status.</p>
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--color-dark-text-muted)' }}>Confidence alerts</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>—</p>
            <p className="text-xs" style={{ color: 'var(--color-dark-text-muted)' }}>Improve low-confidence fields quickly.</p>
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--color-dark-text-muted)' }}>Latest Q&A</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>—</p>
            <p className="text-xs" style={{ color: 'var(--color-dark-text-muted)' }}>See the most recent coverage questions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
