import { useEffect, useState } from "react";
import { policyApi } from "../../api/policyApi";
import { Button } from "../common/Button";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import { ApiError } from "../../api/apiClient";

interface SelectTwoPoliciesProps {
  onSelect: (policyId1: string, policyId2: string) => void;
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

export function SelectTwoPolicies({ onSelect }: SelectTwoPoliciesProps) {
  const [policies, setPolicies] = useState<PolicyListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const toggleSelection = (policyId: string) => {
    setSelectedIds((current) => {
      // If already selected, remove it
      if (current.includes(policyId)) {
        return current.filter((id) => id !== policyId);
      }

      // If fewer than 2 selected, add this one
      if (current.length < 2) {
        return [...current, policyId];
      }

      // If already 2 selected and this is a third, ignore the click
      return current;
    });
  };

  const handleContinue = () => {
    if (selectedIds.length === 2) {
      const [policyId1, policyId2] = selectedIds;
      onSelect(policyId1, policyId2);
    }
  };

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
          Create at least two policy bundles with uploaded documents to compare them here.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Choose two policies to compare</h2>
        <p className="text-sm text-slate-600">
          Select exactly two of your policy bundles below. You&apos;ll be able to ask comparison
          questions about them on the next screen.
        </p>
      </header>

      <div className="space-y-3">
        {policies.map((policy) => {
          const isSelected = selectedIds.includes(policy.id);

          return (
            <button
              key={policy.id}
              type="button"
              onClick={() => toggleSelection(policy.id)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  {policy.name || "Untitled policy"}
                </p>
                <p className="text-xs text-slate-600">
                  {policy.documentCount} document{policy.documentCount === 1 ? "" : "s"}
                  {policy.summaryUpdatedAt
                    ? " • Summary updated"
                    : policy.hasSummary
                    ? " • Summary available"
                    : " • Summary pending"}
                </p>
              </div>
              <span
                className={`ml-4 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-500"
                }`}
              >
                {isSelected ? "✓" : " "}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Selected {selectedIds.length} / 2.{" "}
          {selectedIds.length < 2 ? "Choose two policies to enable comparison." : ""}
        </p>
        <Button
          variant="primary"
          size="sm"
          disabled={selectedIds.length !== 2}
          onClick={handleContinue}
        >
          Compare selected policies
        </Button>
      </div>
    </section>
  );
}


