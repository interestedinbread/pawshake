interface Source {
  textSnippet?: string;
  pageNumber?: number;
}

interface SourceCitationProps {
  sources: Source[];
}

export function SourceCitation({ sources }: SourceCitationProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
      <p className="mb-2 font-medium text-slate-500">Source references</p>
      <ul className="space-y-1">
        {sources.map((source, index) => (
          <li key={index}>
            <span className="text-slate-500">Page {source.pageNumber ?? '–'}:</span>{' '}
            <span className="text-slate-700">{source.textSnippet ?? 'No snippet available.'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
