import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Skeleton loader for the complete Claim Checklist
 */
export function ChecklistSkeleton() {
  return (
    <SkeletonTheme baseColor="#334155" highlightColor="#475569">
      <div className="rounded-2xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton width={180} height={24} />
          <Skeleton width={120} height={36} borderRadius={6} />
        </div>

        <div className="space-y-6">
          {/* Summary section skeleton */}
          <div className="rounded-xl border p-4 border-[rgba(59,130,246,0.5)] bg-[rgba(59,130,246,0.15)]">
            <Skeleton width="100%" height={60} />
          </div>

          {/* Coverage Status Card skeleton */}
          <div className="rounded-xl border-2 p-6 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton width={40} height={40} borderRadius={20} />
              <div className="flex-1">
                <Skeleton width={150} height={20} />
                <Skeleton width={120} height={14} className="mt-1" />
              </div>
              <Skeleton width={70} height={24} borderRadius={12} />
            </div>

            {/* Covered aspects */}
            <div className="mb-4">
              <Skeleton width={120} height={14} className="mb-2" />
              <div className="space-y-2">
                <Skeleton width="80%" height={16} />
                <Skeleton width="75%" height={16} />
                <Skeleton width="85%" height={16} />
              </div>
            </div>

            {/* Badges */}
            <div className="mb-4 flex gap-2">
              <Skeleton width={140} height={24} borderRadius={12} />
              <Skeleton width={130} height={24} borderRadius={12} />
            </div>

            {/* Estimated coverage */}
            <div className="rounded-lg p-4 bg-[var(--color-dark-card)]">
              <Skeleton width={180} height={14} className="mb-2" />
              <Skeleton width={80} height={24} />
            </div>
          </div>

          {/* Required Documents skeleton */}
          <div className="rounded-xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
            <header className="mb-4">
              <Skeleton width={180} height={24} />
              <Skeleton width={250} height={16} className="mt-1" />
            </header>

            <div className="space-y-3">
              {/* Document card 1 */}
              <div className="rounded-lg border p-4 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton width={200} height={18} className="mb-2" />
                    <Skeleton width={150} height={14} />
                  </div>
                  <Skeleton width={24} height={24} borderRadius={12} />
                </div>
              </div>

              {/* Document card 2 */}
              <div className="rounded-lg border p-4 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton width={180} height={18} className="mb-2" />
                    <Skeleton width={140} height={14} />
                  </div>
                  <Skeleton width={24} height={24} borderRadius={12} />
                </div>
              </div>

              {/* Document card 3 */}
              <div className="rounded-lg border p-4 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton width={220} height={18} className="mb-2" />
                    <Skeleton width={160} height={14} />
                  </div>
                  <Skeleton width={24} height={24} borderRadius={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Steps skeleton */}
          <div className="rounded-xl border p-6 shadow-sm bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
            <header className="mb-4">
              <Skeleton width={140} height={24} />
              <Skeleton width={200} height={16} className="mt-1" />
            </header>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <Skeleton width={32} height={32} borderRadius={16} />
                <div className="flex-1">
                  <Skeleton width="90%" height={18} className="mb-2" />
                  <Skeleton width={100} height={20} borderRadius={10} />
                  <Skeleton width={150} height={12} className="mt-1" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <Skeleton width={32} height={32} borderRadius={16} />
                <div className="flex-1">
                  <Skeleton width="85%" height={18} className="mb-2" />
                  <Skeleton width={100} height={20} borderRadius={10} />
                  <Skeleton width={180} height={12} className="mt-1" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <Skeleton width={32} height={32} borderRadius={16} />
                <div className="flex-1">
                  <Skeleton width="80%" height={18} className="mb-2" />
                  <Skeleton width={100} height={20} borderRadius={10} />
                  <Skeleton width={140} height={12} className="mt-1" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <Skeleton width={32} height={32} borderRadius={16} />
                <div className="flex-1">
                  <Skeleton width="88%" height={18} className="mb-2" />
                  <Skeleton width={100} height={20} borderRadius={10} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}

