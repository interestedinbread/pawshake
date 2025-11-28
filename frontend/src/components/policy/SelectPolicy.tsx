import { useEffect, useState } from "react";
import { policyApi } from "../../api/policyApi";
import { Button } from "../common/Button";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import { ApiError } from "../../api/apiClient";
import { SelectPolicySkeleton } from "./PolicySelectionSkeleton";

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
        const statusCode = err instanceof ApiError ? err.statusCode : undefined;
        const message = getUserFriendlyErrorMessage(
          err,
          statusCode,
          { action: 'load policies', resource: 'policies' }
        );
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
    return <SelectPolicySkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border p-6 border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] text-[#fca5a5]">
        <p className="font-semibold">Unable to load your policies.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <div className="rounded-2xl border p-6 border-[rgba(245,158,11,0.5)] bg-[rgba(245,158,11,0.1)] text-[#fbbf24]">
        <p className="font-medium">No policies found.</p>
        <p className="text-sm">
          Create a policy and upload documents first, then you&apos;ll be able to view a summary
          here.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border p-6 shadow-sm space-y-4 bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-[var(--color-dark-text-primary)]">Choose a policy</h2>
        <p className="text-sm text-[var(--color-dark-text-secondary)]">
          Select one of your policy bundles below to proceed.
        </p>
      </header>

      <div className="space-y-3">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="flex items-center justify-between rounded-lg border px-4 py-3 bg-[var(--color-dark-card)] border-[var(--color-dark-border)]"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--color-dark-text-primary)]">
                {policy.name || "Untitled policy"}
              </p>
              <p className="text-xs text-[var(--color-dark-text-secondary)]">
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
              OK
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}