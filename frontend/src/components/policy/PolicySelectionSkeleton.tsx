import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Skeleton for a single policy list item
 */
function PolicyItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]">
      <div className="flex-1 space-y-1">
        <Skeleton width={200} height={16} />
        <Skeleton width={150} height={12} />
      </div>
      <Skeleton width={50} height={32} borderRadius={6} />
    </div>
  );
}

/**
 * Skeleton for SelectPolicy component
 */
export function SelectPolicySkeleton() {
  return (
    <SkeletonTheme baseColor="#334155" highlightColor="#475569">
      <section className="rounded-2xl border p-6 shadow-sm space-y-4 bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <header className="space-y-1">
          <Skeleton width={150} height={24} />
          <Skeleton width={300} height={16} />
        </header>

        <div className="space-y-3">
          <PolicyItemSkeleton />
          <PolicyItemSkeleton />
          <PolicyItemSkeleton />
        </div>
      </section>
    </SkeletonTheme>
  );
}

/**
 * Skeleton for SelectTwoPolicies component
 */
export function SelectTwoPoliciesSkeleton() {
  return (
    <SkeletonTheme baseColor="#334155" highlightColor="#475569">
      <section className="rounded-2xl border p-6 shadow-sm space-y-4 bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <header className="space-y-1">
          <Skeleton width={250} height={24} />
          <Skeleton width={400} height={16} />
        </header>

        <div className="space-y-3">
          <PolicyItemSkeleton />
          <PolicyItemSkeleton />
          <PolicyItemSkeleton />
          <PolicyItemSkeleton />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Skeleton width={180} height={14} />
          <Skeleton width={180} height={36} borderRadius={6} />
        </div>
      </section>
    </SkeletonTheme>
  );
}

