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

  // Filter to only sources with page numbers and get unique page numbers
  const pageNumbers = Array.from(
    new Set(
      sources
        .map((source) => source.pageNumber)
        .filter((page): page is number => page !== undefined && page !== null)
    )
  ).sort((a, b) => a - b);

  if (pageNumbers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
      <p className="mb-1.5 font-medium text-slate-500">Source references</p>
      <p className="text-slate-600">
        Page{pageNumbers.length > 1 ? 's' : ''}: {pageNumbers.join(', ')}
      </p>
    </div>
  );
}
