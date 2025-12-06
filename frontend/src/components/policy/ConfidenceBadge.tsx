interface ConfidenceBadgeProps {
  level?: 'high' | 'medium' | 'low' | null;
}

const levelConfig = {
  high: {
    label: 'High confidence',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  medium: {
    label: 'Medium confidence',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  low: {
    label: 'Low confidence',
    classes: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
  unknown: {
    label: 'Confidence unknown',
    classes: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
} as const;

export function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const config = level ? levelConfig[level] : levelConfig.unknown;

  return (
    <span
      className={`flex items-center gap-2 rounded-full px-2 md:px-4 py-1 text-[0.6rem] md:text-sm font-medium ${config.classes}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}
