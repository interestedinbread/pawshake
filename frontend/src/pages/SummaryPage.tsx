import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../api/documentApi';
import { policyApi } from '../api/policyApi';
import { SelectPolicy } from '../components/policy/SelectPolicy';
import { SummaryHeader } from '../components/policy/SummaryHeader';
import { FinancialDetails } from '../components/policy/FinancialDetails';
import { WaitingPeriods } from '../components/policy/WaitingPeriods';
import { CoverageDetails } from '../components/policy/CoverageDetails';
import { SummaryPageSkeleton } from '../components/policy/SummarySkeleton';
import { Button } from '../components/common/Button';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { ApiError } from '../api/apiClient';

interface PolicySummaryData {
  planName?: string | null;
  insurer?: string | null;
  policyNumber?: string | null;
  deductible?: {
    amount?: number | null;
    type?: string | null;
    appliesTo?: string | null;
  } | null;
  reimbursementRate?: number | null;
  annualMaximum?: number | 'unlimited' | null;
  perIncidentMaximum?: number | 'unlimited' | null;
  waitingPeriod?: {
    accident?: number | null;
    illness?: number | null;
    orthopedic?: number | null;
    cruciate?: number | null;
  } | null;
  coverageTypes?: string[] | null;
  exclusions?: string[] | null;
  notes?: string | null;
  confidence?: {
    overall?: 'high' | 'medium' | 'low' | null;
    fieldConfidence?: Record<string, 'high' | 'medium' | 'low' | null>;
  } | null;
  sources?: Record<string, Array<{ textSnippet?: string; pageNumber?: number }>> | null;
}

interface PolicySummaryMetadata {
  createdAt: string;
  updatedAt: string | null;
}

export function SummaryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policyId = searchParams.get('policyId');

  const [summary, setSummary] = useState<PolicySummaryData | null>(null);
  const [metadata, setMetadata] = useState<PolicySummaryMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = policyId;

    if (!id) {
      // No policy selected yet; SelectPolicy will handle prompting the user
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);
        const response = await documentApi.getPolicySummary(id!);
        if (!isMounted) return;
        setSummary(response.summary as PolicySummaryData);
        setMetadata(response.metadata);
      } catch (err) {
        if (!isMounted) return;
        const statusCode = err instanceof ApiError ? err.statusCode : undefined;
        const message = getUserFriendlyErrorMessage(
          err,
          statusCode,
          { action: 'load policy summary', resource: 'policy summary' }
        );
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [policyId]);

  const fieldConfidence = useMemo(() => summary?.confidence?.fieldConfidence ?? {}, [summary]);
  const sources = useMemo(() => summary?.sources ?? {}, [summary]);

  const handleRefresh = async () => {
    if (!policyId) return;
    setLoading(true);
    setError(null);
    try {
      // Trigger re-extraction of the policy summary
      await policyApi.reExtractPolicySummary(policyId);
      // Fetch the newly extracted summary
      const response = await documentApi.getPolicySummary(policyId);
      setSummary(response.summary as PolicySummaryData);
      setMetadata(response.metadata);
    } catch (err) {
      const statusCode = err instanceof ApiError ? err.statusCode : undefined;
      const message = getUserFriendlyErrorMessage(
        err,
        statusCode,
        { action: 'refresh policy summary', resource: 'policy summary' }
      );
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Placeholder for future download implementation
    // Could trigger a backend endpoint or generate PDF client-side
    // For now, navigate back to upload as a hint
    navigate('/upload');
  };

  if (!policyId) {
    // No policy ID in URL: let the user choose a policy first
    return (
      <SelectPolicy
        onSelect={(id) => {
          navigate(`/summary?policyId=${encodeURIComponent(id)}`);
        }}
      />
    );
  }

  if (loading && !summary) {
    return <SummaryPageSkeleton />;
  }

  if (error && !summary) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">Unable to load policy summary.</p>
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const overallConfidence = summary.confidence?.overall ?? null;

  return (
    <div className="space-y-6">
      <SummaryHeader
        planName={summary.planName ?? undefined}
        insurer={summary.insurer ?? undefined}
        policyNumber={summary.policyNumber ?? undefined}
        lastUpdated={metadata?.updatedAt ?? metadata?.createdAt ?? undefined}
        confidence={overallConfidence}
        onRefresh={handleRefresh}
        onDownload={handleDownload}
        isRefreshing={loading}
      />

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        <div className="space-y-6">
          <FinancialDetails
            deductible={summary.deductible ?? null}
            reimbursementRate={summary.reimbursementRate ?? null}
            annualMaximum={summary.annualMaximum ?? null}
            perIncidentMaximum={summary.perIncidentMaximum ?? null}
            confidence={{
              reimbursementRate: fieldConfidence.reimbursementRate ?? null,
              annualMaximum: fieldConfidence.annualMaximum ?? null,
              perIncidentMaximum: fieldConfidence.perIncidentMaximum ?? null,
            }}
            sources={{
              reimbursementRate: sources.reimbursementRate,
              annualMaximum: sources.annualMaximum,
              perIncidentMaximum: sources.perIncidentMaximum,
            }}
          />

          <WaitingPeriods
            waitingPeriod={summary.waitingPeriod ?? undefined}
            confidence={{
              overall: fieldConfidence.waitingPeriod ?? null,
              accident: fieldConfidence.waitingPeriod ?? null,
              illness: fieldConfidence.waitingPeriod ?? null,
              orthopedic: fieldConfidence.waitingPeriod ?? null,
              cruciate: fieldConfidence.waitingPeriod ?? null,
            }}
            sources={{
              accident: sources.waitingPeriod,
              illness: sources.waitingPeriod,
              orthopedic: sources.waitingPeriod,
              cruciate: sources.waitingPeriod,
            }}
          />
        </div>

        <CoverageDetails
          coverageTypes={summary.coverageTypes ?? []}
          exclusions={summary.exclusions ?? []}
          notes={summary.notes ?? null}
          confidence={{
            coverageTypes: fieldConfidence.coverageTypes ?? null,
            exclusions: fieldConfidence.exclusions ?? null,
            notes: fieldConfidence.notes ?? null,
          }}
          sources={{
            coverageTypes: sources.coverageTypes,
            exclusions: sources.exclusions,
            notes: sources.notes,
          }}
        />
      </div>
    </div>
  );
}