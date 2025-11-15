import { FileUpload } from "../components/upload/FileUpload";
import { UploadSuccess } from "../components/upload/UploadSuccess";
import { documentApi, type UploadPolicyResponse } from "../api/documentApi";
import { policyApi } from "../api/policyApi";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { useState } from "react";
import type { FormEvent } from "react";

type Step = 'create' | 'upload' | 'success';

export function UploadPage() {
    const [step, setStep] = useState<Step>('create');
    const [policyName, setPolicyName] = useState('');
    const [policyDescription, setPolicyDescription] = useState('');
    const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(null);
    const [createdPolicyName, setCreatedPolicyName] = useState<string | null>(null);
    const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadResponse, setUploadResponse] = useState<UploadPolicyResponse | null>(null);

    const handleCreatePolicy = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsCreatingPolicy(true);

        try {
            const response = await policyApi.createPolicy(policyName.trim(), policyDescription.trim() || undefined);
            setCreatedPolicyId(response.result.id);
            setCreatedPolicyName(response.result.name);
            setStep('upload');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create policy. Please try again.';
            setError(message);
            console.error('Error creating policy:', err);
        } finally {
            setIsCreatingPolicy(false);
        }
    };

    const handleUpload = async (files: File[]) => {
        if (!createdPolicyId) {
            throw new Error('Policy ID is required. Please create a policy first.');
        }

        if (files.length === 0) {
            throw new Error('Please select at least one file to upload.');
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await documentApi.uploadPolicy(files, createdPolicyId);
            setUploadResponse(response);
            setStep('success');
        } catch (err) {
            console.error('Error uploading files:', err);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUploadMore = () => {
        setUploadResponse(null);
        setError(null);
        setStep('upload');
    };

    const handleBack = () => {
        setStep('create');
        setError(null);
    };

    if (step === 'create') {
        return (
            <div className="max-w-2xl mx-auto">
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <form onSubmit={handleCreatePolicy} className="flex flex-col gap-6 p-6">
                        <header className="space-y-2">
                            <h2 className="text-2xl font-semibold text-slate-900">Create Policy Bundle</h2>
                            <p className="text-sm text-slate-600">
                                Give your policy bundle a name to organize your documents. You can add multiple PDFs to the same bundle.
                            </p>
                        </header>

                        {error && (
                            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Policy Name"
                                type="text"
                                value={policyName}
                                onChange={(e) => setPolicyName(e.target.value)}
                                placeholder="e.g., Trupanion - Max's Policy"
                                required
                                fullWidth
                                disabled={isCreatingPolicy}
                            />

                            <Input
                                label="Description (Optional)"
                                type="text"
                                value={policyDescription}
                                onChange={(e) => setPolicyDescription(e.target.value)}
                                placeholder="Add any notes about this policy bundle"
                                fullWidth
                                disabled={isCreatingPolicy}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                isLoading={isCreatingPolicy}
                                disabled={isCreatingPolicy || !policyName.trim()}
                            >
                                Create Policy & Continue
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        );
    }

    if (step === 'success' && uploadResponse) {
        return (
            <div className="max-w-4xl mx-auto">
                <UploadSuccess
                    policyId={uploadResponse.policy.id}
                    policyName={uploadResponse.policy.name}
                    summary={uploadResponse.summary}
                    results={uploadResponse.results}
                    onUploadMore={handleUploadMore}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Policy info banner */}
            {createdPolicyName && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-900">Uploading to: {createdPolicyName}</p>
                        <p className="text-xs text-blue-700 mt-1">You can upload multiple PDFs to this policy bundle</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        disabled={isSubmitting}
                    >
                        Change Policy
                    </Button>
                </div>
            )}

            <FileUpload
                onSubmit={handleUpload}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

