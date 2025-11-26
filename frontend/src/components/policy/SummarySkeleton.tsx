import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Skeleton loader for SummaryHeader component
 */
export function SummaryHeaderSkeleton() {
  return (
    <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <Skeleton width={120} height={16} className="mb-2" />
          <Skeleton width={300} height={36} className="mb-2" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton width={150} height={16} />
            <Skeleton width={180} height={16} />
          </div>
          <Skeleton width={200} height={14} className="mt-2" />
        </div>

        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center">
          <Skeleton width={80} height={24} borderRadius={12} />
          <div className="flex gap-3">
            <Skeleton width={120} height={36} borderRadius={6} />
            <Skeleton width={100} height={36} borderRadius={6} />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Skeleton loader for FinancialDetails component
 */
export function FinancialDetailsSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Financial Details</h2>
      <div className="space-y-4">
        {/* Deductible */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={20} borderRadius={10} />
          </div>
          <Skeleton width={200} height={20} />
          <Skeleton width={150} height={12} className="mt-1" />
        </div>

        {/* Reimbursement Rate */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton width={140} height={16} />
            <Skeleton width={60} height={20} borderRadius={10} />
          </div>
          <Skeleton width={100} height={20} />
          <Skeleton width={150} height={12} className="mt-1" />
        </div>

        {/* Annual Maximum */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton width={120} height={16} />
            <Skeleton width={60} height={20} borderRadius={10} />
          </div>
          <Skeleton width={150} height={20} />
          <Skeleton width={150} height={12} className="mt-1" />
        </div>

        {/* Per Incident Maximum */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Skeleton width={160} height={16} />
            <Skeleton width={60} height={20} borderRadius={10} />
          </div>
          <Skeleton width={150} height={20} />
          <Skeleton width={150} height={12} className="mt-1" />
        </div>
      </div>
    </section>
  );
}

/**
 * Skeleton loader for WaitingPeriods component
 */
export function WaitingPeriodsSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Waiting Periods</h2>
        <Skeleton width={60} height={20} borderRadius={10} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Accident */}
        <div>
          <Skeleton width={80} height={14} className="mb-2" />
          <Skeleton width={120} height={18} />
        </div>

        {/* Illness */}
        <div>
          <Skeleton width={70} height={14} className="mb-2" />
          <Skeleton width={120} height={18} />
        </div>

        {/* Orthopedic */}
        <div>
          <Skeleton width={90} height={14} className="mb-2" />
          <Skeleton width={120} height={18} />
        </div>

        {/* Cruciate */}
        <div>
          <Skeleton width={100} height={14} className="mb-2" />
          <Skeleton width={120} height={18} />
        </div>
      </div>
      <Skeleton width={200} height={12} className="mt-4" />
    </section>
  );
}

/**
 * Skeleton loader for CoverageDetails component
 */
export function CoverageDetailsSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Coverage Details</h2>
      
      {/* Coverage Types */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton width={120} height={16} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </div>
        <div className="space-y-2">
          <Skeleton width="90%" height={16} />
          <Skeleton width="85%" height={16} />
          <Skeleton width="75%" height={16} />
        </div>
        <Skeleton width={150} height={12} className="mt-2" />
      </div>

      {/* Exclusions */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton width={100} height={16} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </div>
        <div className="space-y-2">
          <Skeleton width="80%" height={16} />
          <Skeleton width="90%" height={16} />
          <Skeleton width="70%" height={16} />
        </div>
        <Skeleton width={150} height={12} className="mt-2" />
      </div>

      {/* Notes */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </div>
        <Skeleton width="100%" height={60} />
        <Skeleton width={150} height={12} className="mt-2" />
      </div>
    </section>
  );
}

/**
 * Complete skeleton for the entire SummaryPage
 */
export function SummaryPageSkeleton() {
  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-6">
        <SummaryHeaderSkeleton />

        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <div className="space-y-6">
            <FinancialDetailsSkeleton />
            <WaitingPeriodsSkeleton />
          </div>

          <CoverageDetailsSkeleton />
        </div>
      </div>
    </SkeletonTheme>
  );
}

