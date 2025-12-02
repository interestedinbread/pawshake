import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Skeleton loader for UploadSuccess component
 * Shows while files are being uploaded and processed
 */
export function UploadSuccessSkeleton() {
  return (
    <SkeletonTheme baseColor="#334155" highlightColor="#475569">
      <div className="rounded-2xl border shadow-lg bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <div className="p-6 space-y-6">
          {/* Success Header skeleton */}
          <div className="flex items-start gap-4">
            <Skeleton width={48} height={48} borderRadius={24} />
            <div className="flex-1">
              <Skeleton width={200} height={28} className="mb-2" />
              <Skeleton width={300} height={16} />
            </div>
          </div>

          {/* Statistics skeleton */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--color-dark-card)] rounded-lg border border-[var(--color-dark-border)] p-4 text-center">
              <Skeleton width={40} height={32} className="mx-auto mb-2" />
              <Skeleton width={80} height={14} className="mx-auto" />
            </div>
            <div className="bg-[var(--color-dark-card)] rounded-lg border border-emerald-500/30 p-4 text-center">
              <Skeleton width={40} height={32} className="mx-auto mb-2" />
              <Skeleton width={80} height={14} className="mx-auto" />
            </div>
            <div className="bg-[var(--color-dark-card)] rounded-lg border border-[rgba(239,68,68,0.3)] p-4 text-center">
              <Skeleton width={40} height={32} className="mx-auto mb-2" />
              <Skeleton width={80} height={14} className="mx-auto" />
            </div>
          </div>

          {/* Successful Files List skeleton */}
          <div>
            <Skeleton width={200} height={18} className="mb-2" />
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <div className="flex items-center gap-2 bg-[var(--color-dark-card)] border border-emerald-500/30 rounded px-3 py-2">
                <Skeleton width={16} height={16} />
                <Skeleton width={200} height={16} />
              </div>
              <div className="flex items-center gap-2 bg-[var(--color-dark-card)] border border-emerald-500/30 rounded px-3 py-2">
                <Skeleton width={16} height={16} />
                <Skeleton width={180} height={16} />
              </div>
              <div className="flex items-center gap-2 bg-[var(--color-dark-card)] border border-emerald-500/30 rounded px-3 py-2">
                <Skeleton width={16} height={16} />
                <Skeleton width={220} height={16} />
              </div>
            </div>
          </div>

          {/* Action Buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--color-dark-border)]">
            <Skeleton width="100%" height={40} borderRadius={6} />
            <Skeleton width="100%" height={40} borderRadius={6} />
            <Skeleton width="100%" height={40} borderRadius={6} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}

