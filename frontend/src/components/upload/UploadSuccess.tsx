import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

interface UploadedDocument {
  id: string;
  filename: string;
  pageCount: number;
  documentType: string;
  createdAt: string;
}

interface UploadResult {
  status: 'success' | 'error';
  document?: UploadedDocument;
  filename?: string;
  error?: string;
}

interface UploadSuccessProps {
  policyId: string;
  policyName: string;
  summary: {
    totalFiles: number;
    successful: number;
    failed: number;
  };
  results: UploadResult[];
  onUploadMore?: () => void;
}

export function UploadSuccess({
  policyId,
  policyName,
  summary,
  results,
  onUploadMore,
}: UploadSuccessProps) {
  const navigate = useNavigate();

  const failedFiles = results.filter((r) => r.status === 'error');
  const successfulFiles = results.filter((r) => r.status === 'success');

  const handleViewSummary = () => {
    navigate(`/summary?policyId=${policyId}`);
  };

  const handleGoToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="rounded-2xl border shadow-lg bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <div className="p-6 space-y-6">
        {/* Success Header */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">
              Upload Complete!
            </h2>
            <p className="text-sm text-[var(--color-dark-text-secondary)] mt-1">
              Files have been uploaded to <span className="font-medium text-[var(--color-primary)]">{policyName}</span>
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--color-dark-card)] rounded-lg border border-[var(--color-dark-border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--color-dark-text-primary)]">{summary.totalFiles}</p>
            <p className="text-xs text-[var(--color-dark-text-secondary)] mt-1">Total Files</p>
          </div>
          <div className="bg-[var(--color-dark-card)] rounded-lg border border-emerald-500/30 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.successful}</p>
            <p className="text-xs text-[var(--color-dark-text-secondary)] mt-1">Successful</p>
          </div>
          <div className="bg-[var(--color-dark-card)] rounded-lg border border-[rgba(239,68,68,0.3)] p-4 text-center">
            <p className="text-2xl font-bold text-[#f87171]">{summary.failed}</p>
            <p className="text-xs text-[var(--color-dark-text-secondary)] mt-1">Failed</p>
          </div>
        </div>

        {/* Successful Files List */}
        {successfulFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-dark-text-primary)] mb-2">
              Successfully Uploaded ({successfulFiles.length})
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {successfulFiles.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[var(--color-dark-card)] border border-emerald-500/30 rounded px-3 py-2 text-sm"
                >
                  <svg
                    className="w-4 h-4 text-emerald-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-[var(--color-dark-text-primary)] truncate">
                    {result.document?.filename || result.filename}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Files List */}
        {failedFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-dark-text-primary)] mb-2">
              Failed Uploads ({failedFiles.length})
            </h3>
            <div className="space-y-2">
              {failedFiles.map((result, index) => (
                <div
                  key={index}
                  className="bg-[var(--color-dark-card)] border border-[rgba(239,68,68,0.3)] rounded px-3 py-2 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-[#f87171] flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-dark-text-primary)] truncate">
                        {result.filename || 'Unknown file'}
                      </p>
                      {result.error && (
                        <p className="text-xs text-[#fca5a5] mt-1">{result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-dark-border)]">
          {summary.successful > 0 && (
            <Button
              variant="primary"
              size="md"
              onClick={handleViewSummary}
              className="flex-1"
            >
              View Policy Summary
            </Button>
          )}
          {onUploadMore && (
            <Button
              variant="outline"
              size="md"
              onClick={onUploadMore}
              className="flex-1"
            >
              Upload More Files
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            onClick={handleGoToDashboard}
            className="flex-1"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

