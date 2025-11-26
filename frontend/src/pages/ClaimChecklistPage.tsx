import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { coverageApi, type CoverageChecklist } from '../api/coverageApi';
import { SelectPolicy } from '../components/policy/SelectPolicy';
import { CoverageChecklistCard } from '../components/coverage/CoverageChecklistCard';
import { Button } from '../components/common/Button';
import { policyApi } from '../api/policyApi';
import { generateChecklistPDF } from '../utils/checklistPdfGenerator';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';
import { ApiError } from '../api/apiClient';

export function ClaimChecklistPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policyId = searchParams.get('policyId');

  const [incidentDescription, setIncidentDescription] = useState('');
  const [checklist, setChecklist] = useState<CoverageChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyName, setPolicyName] = useState<string | undefined>(undefined);

  // Fetch policy name when policyId is available
  useEffect(() => {
    if (policyId) {
      policyApi
        .getPolicies()
        .then((response) => {
          const policy = response.policies.find((p) => p.id === policyId);
          if (policy) {
            setPolicyName(policy.name);
          }
        })
        .catch(() => {
          // Silently fail - policy name is optional
        });
    }
  }, [policyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyId) {
      setError('Please select a policy first');
      return;
    }

    if (!incidentDescription.trim()) {
      setError('Please describe the incident');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await coverageApi.checkCoverage(policyId, incidentDescription);
      setChecklist(result);
    } catch (err) {
      const statusCode = err instanceof ApiError ? err.statusCode : undefined;
      const errorMessage = getUserFriendlyErrorMessage(
        err,
        statusCode,
        { action: 'generate checklist', resource: 'checklist' }
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!policyId) {
    // No policy ID in URL: let the user choose a policy first
    return (
      <SelectPolicy
        onSelect={(id) => {
          navigate(`/claim-checklist?policyId=${encodeURIComponent(id)}`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Claim Checklist</h1>
        <p className="mt-1 text-sm text-slate-600">
          Describe an incident to get a detailed checklist with required documents and action steps.
        </p>
      </div>

      {/* Incident Description Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="incident-description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Describe the incident or your pet's condition
            </label>
            <textarea
              id="incident-description"
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="e.g., My dog broke his leg playing fetch in the park yesterday afternoon..."
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-slate-500">
              Be as specific as possible about what happened, when it occurred, and your pet's
              current condition.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isLoading || !incidentDescription.trim()}>
              {isLoading ? 'Generating checklist...' : 'Generate Checklist'}
            </Button>
          </div>
        </form>
      </div>

      {/* Checklist Result */}
      {checklist && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your Claim Checklist</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await generateChecklistPDF(checklist, incidentDescription, policyName);
                } catch (error) {
                  console.error('Failed to generate PDF:', error);
                  const errorMessage = getUserFriendlyErrorMessage(
                    error,
                    undefined,
                    { action: 'generate PDF', resource: 'PDF' }
                  );
                  setError(errorMessage);
                }
              }}
            >
              📄 Download PDF
            </Button>
          </div>
          <CoverageChecklistCard checklist={checklist} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && !checklist && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 [animation-delay:0.2s]" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 [animation-delay:0.4s]" />
            <span className="ml-2 text-sm text-slate-600">Analyzing incident and generating checklist...</span>
          </div>
        </div>
      )}
    </div>
  );
}
