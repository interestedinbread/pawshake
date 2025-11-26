import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { policyApi } from '../../api/policyApi';
import { Button } from '../common/Button';
import { ConfirmationDialogue } from '../common/ConfirmationDialogue';
import { getUserFriendlyErrorMessage } from '../../utils/errorMessages';
import { ApiError } from '../../api/apiClient';

interface PolicyListItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  lastDocumentAt: string | null;
  summaryUpdatedAt: string | null;
  summaryConfidence: 'high' | 'medium' | 'low' | null;
  hasSummary: boolean;
}

export function PoliciesCard() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<PolicyListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<PolicyListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await policyApi.getPolicies();
      setPolicies(response.policies);
    } catch (err) {
      const statusCode = err instanceof ApiError ? err.statusCode : undefined;
      const message = getUserFriendlyErrorMessage(
        err,
        statusCode,
        { action: 'load policies', resource: 'policies' }
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDeleteClick = (policy: PolicyListItem) => {
    setPolicyToDelete(policy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!policyToDelete) return;

    setIsDeleting(true);
    try {
      await policyApi.deletePolicy(policyToDelete.id);
      // Refresh the policies list
      await fetchPolicies();
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
    } catch (err) {
      const statusCode = err instanceof ApiError ? err.statusCode : undefined;
      const errorMessage = getUserFriendlyErrorMessage(
        err,
        statusCode,
        { action: 'delete policy', resource: 'policy' }
      );
      setError(errorMessage);
      // Keep dialog open on error so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPolicyToDelete(null);
  };

  const getSummaryStatus = (policy: PolicyListItem): string => {
    if (policy.summaryUpdatedAt) {
      return 'Summary updated';
    }
    if (policy.hasSummary) {
      return 'Summary available';
    }
    return 'Summary pending';
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h3 className="text-xl font-semibold text-slate-900">My Policies</h3>
        </header>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">My Policies</h3>
            <p className="text-sm text-slate-600">
              Manage your policy bundles and documents.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/upload')}
          >
            + New Policy
          </Button>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {policies.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="font-medium text-amber-900 mb-2">No policies yet</p>
            <p className="text-sm text-amber-700 mb-4">
              Create your first policy bundle to get started.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/upload')}
            >
              Create Policy
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-slate-300"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {policy.name || 'Untitled policy'}
                    </p>
                    {policy.summaryConfidence && (
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          policy.summaryConfidence === 'high'
                            ? 'bg-emerald-100 text-emerald-700'
                            : policy.summaryConfidence === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {policy.summaryConfidence}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {policy.documentCount} document{policy.documentCount === 1 ? '' : 's'} • {getSummaryStatus(policy)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/summary?policyId=${encodeURIComponent(policy.id)}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(policy)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      {policyToDelete && (
        <ConfirmationDialogue
          isOpen={deleteDialogOpen}
          title="Delete Policy"
          message={`Are you sure you want to delete "${policyToDelete.name}"?`}
          details={`This will permanently delete the policy bundle, all ${policyToDelete.documentCount} associated document${policyToDelete.documentCount === 1 ? '' : 's'}, summaries, and embeddings. This action cannot be undone.`}
          variant="danger"
          confirmText="Delete Policy"
          isConfirming={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </>
  );
}

