import { EditableField } from './EditableField';
import { SourceCitation } from './SourceCitation';
import { ConfidenceBadge } from './ConfidenceBadge';

interface WaitingPeriodsValues {
  accident?: number | null;
  illness?: number | null;
  orthopedic?: number | null;
  cruciate?: number | null;
}

interface WaitingPeriodConfidence {
  overall?: 'high' | 'medium' | 'low' | null;
  accident?: 'high' | 'medium' | 'low' | null;
  illness?: 'high' | 'medium' | 'low' | null;
  orthopedic?: 'high' | 'medium' | 'low' | null;
  cruciate?: 'high' | 'medium' | 'low' | null;
}

interface WaitingPeriodsProps {
  waitingPeriod?: WaitingPeriodsValues | null;
  confidence?: WaitingPeriodConfidence;
  sources?: {
    accident?: Array<{ textSnippet?: string; pageNumber?: number }>;
    illness?: Array<{ textSnippet?: string; pageNumber?: number }>;
    orthopedic?: Array<{ textSnippet?: string; pageNumber?: number }>;
    cruciate?: Array<{ textSnippet?: string; pageNumber?: number }>;
  };
  onEdit?: (field: string, value: string) => void;
}

function formatDays(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Unknown';
  }
  if (value === 0) {
    return 'No waiting period';
  }
  if (value === 1) {
    return '1 day';
  }
  return `${value} days`;
}

export function WaitingPeriods({ waitingPeriod, confidence, sources, onEdit }: WaitingPeriodsProps) {
  const entries: Array<{
    label: string;
    key: keyof WaitingPeriodsValues;
  }> = [
    { label: 'Accident', key: 'accident' },
    { label: 'Illness', key: 'illness' },
    { label: 'Orthopedic', key: 'orthopedic' },
    { label: 'Cruciate', key: 'cruciate' },
  ];

  return (
    <section className="rounded-2xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Waiting periods</h2>
          <p className="text-sm text-[var(--color-dark-text-secondary)]">
            Time before coverage begins for different conditions.
          </p>
        </div>
        {confidence?.overall && <ConfidenceBadge level={confidence.overall} />}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map(({ label, key }) => {
          const value = waitingPeriod?.[key];
          const fieldConfidence = confidence?.[key];
          const fieldSources = sources?.[key];

          return (
            <div key={key} className="space-y-3 rounded-xl border p-4 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--color-dark-text-primary)]">{label}</h3>
                {fieldConfidence && <ConfidenceBadge level={fieldConfidence} />}
              </div>
              <EditableField
                value={formatDays(value)}
                onEdit={onEdit ? (newValue) => onEdit(`waitingPeriod.${key}`, newValue) : undefined}
              />
              {fieldSources && fieldSources.length > 0 && (
                <SourceCitation sources={fieldSources} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
