import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

export type PolicyConfidence = 'high' | 'medium' | 'low';
export type PolicySummaryStatus = 'complete' | 'processing' | 'pending';

export interface PolicyCardProps {
  id: string;
  planName?: string | null;
  company?: string | null;
  documentType?: string | null;
  uploadedAt: string; // ISO timestamp
  pageCount?: number | null;
  summaryStatus?: PolicySummaryStatus;
  confidence?: PolicyConfidence | null;
}

function confidenceStyles(confidence?: PolicyConfidence | null) {
  switch (confidence) {
    case 'high':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'low':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

function statusLabel(status?: PolicySummaryStatus) {
  switch (status) {
    case 'complete':
      return 'Summary complete';
    case 'processing':
      return 'Processing summary';
    case 'pending':
      return 'Awaiting summary';
    default:
      return 'Summary status unknown';
  }
}

export function PolicyCard({
  id,
  planName,
  company,
  documentType,
  uploadedAt,
  pageCount,
  summaryStatus = 'pending',
  confidence = null,
}: PolicyCardProps) {
  const navigate = useNavigate();

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(new Date(uploadedAt));
    } catch {
      return 'Unknown date';
    }
  }, [uploadedAt]);

  const summaryHref = `/summary?documentId=${encodeURIComponent(id)}`;
  const qaHref = `/qa?documentId=${encodeURIComponent(id)}`;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {planName || 'Untitled policy'}
          </h3>
          <p className="text-sm text-slate-600">
            {company ? `${company} • ` : ''}{documentType || 'Policy document'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${confidenceStyles(confidence)}`}>
          Confidence: {confidence ? confidence.toUpperCase() : 'N/A'}
        </span>
      </header>

      <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-medium text-slate-500">Summary status</p>
          <p className="text-slate-900">{statusLabel(summaryStatus)}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">Uploaded</p>
          <p>{formattedDate}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">Page count</p>
          <p>{pageCount ?? '—'}</p>
        </div>
      </div>

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Document ID: {id}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(summaryHref)}
          >
            View summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(qaHref)}
          >
            Ask a question
          </Button>
        </div>
      </footer>
    </article>
  );
}
