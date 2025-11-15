import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { documentApi } from '../api/documentApi';
import { SummaryHeader } from '../components/policy/SummaryHeader';
import { FinancialDetails } from '../components/policy/FinancialDetails';
import { WaitingPeriods } from '../components/policy/WaitingPeriods';
import { CoverageDetails } from '../components/policy/CoverageDetails';
import { Button } from '../components/common/Button';

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
      setError('No document selected. Upload a policy or choose one from your documents.');
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
        const message =
          err instanceof Error ? err.message : 'Failed to load policy summary. Please try again.';
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
      const response = await documentApi.getPolicySummary(policyId!);
      setSummary(response.summary as PolicySummaryData);
      setMetadata(response.metadata);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refresh policy summary. Please try again.';
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
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No policy selected.</p>
        <p className="text-sm">Upload a policy or open one from your documents to view its summary.</p>
        <div className="mt-4 flex gap-3">
          <Button variant="primary" size="sm" onClick={() => navigate('/upload')}>
            Upload policy
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !summary) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Loading policy summary…
      </div>
    );
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