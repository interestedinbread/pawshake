import { useEffect, useState } from "react";
import { policyApi } from "../../api/policyApi";
import { Button } from "../common/Button";

interface SelectPolicyProps {
  onSelect: (policyId: string) => void;
}

interface PolicyListItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  lastDocumentAt: string | null;
  summaryUpdatedAt: string | null;
  summaryConfidence: "high" | "medium" | "low" | null;
  hasSummary: boolean;
}

export function SelectPolicy({ onSelect }: SelectPolicyProps) {
  const [policies, setPolicies] = useState<PolicyListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPolicies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await policyApi.getPolicies();
        if (!isMounted) return;
        setPolicies(response.policies);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load policies. Please try again.";
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPolicies();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        <p>Loading your policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p className="font-semibold">Unable to load your policies.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <p className="font-medium">No policies found.</p>
        <p className="text-sm">
          Create a policy and upload documents first, then you&apos;ll be able to view a summary
          here.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Choose a policy to view</h2>
        <p className="text-sm text-slate-600">
          Select one of your policy bundles to see its consolidated summary.
        </p>
      </header>

      <div className="space-y-3">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                {policy.name || "Untitled policy"}
              </p>
              <p className="text-xs text-slate-600">
                {policy.documentCount} document{policy.documentCount === 1 ? "" : "s"}
                {policy.summaryUpdatedAt
                  ? ` • Summary updated`
                  : policy.hasSummary
                  ? " • Summary available"
                  : " • Summary pending"}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSelect(policy.id)}
            >
              View summary
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}