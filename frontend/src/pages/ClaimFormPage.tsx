import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { claimApi, type FormSchema, type AdditionalFormData } from '../api/claimApi';
import { documentApi } from '../api/documentApi';
import { SelectPolicy } from '../components/policy/SelectPolicy';
import { ClaimFormFields } from '../components/claim/ClaimFormFields';
import { ClaimFormPreview } from '../components/claim/ClaimFormPreview';
import { Button } from '../components/common/Button';

type ViewMode = 'edit' | 'preview';

export function ClaimFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const policyId = searchParams.get('policyId');

  // State
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean | number>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch form schema
  useEffect(() => {
    let isMounted = true;

    async function fetchSchema() {
      try {
        setIsLoading(true);
        setError(null);
        const formSchema = await claimApi.getFormSchema();
        if (!isMounted) return;
        setSchema(formSchema);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load form. Please try again.';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSchema();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch policy summary and auto-fill form when policyId is available
  useEffect(() => {
    if (!policyId || !schema) return;

    let isMounted = true;

    async function fetchAndMapPolicyData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch policy summary
        if (!policyId) return;
        const summaryResponse = await documentApi.getPolicySummary(policyId);
        if (!isMounted) return;

        const summary = summaryResponse.summary as {
          policyNumber?: string | null;
          [key: string]: unknown;
        };

        // Map policy data to form fields
        // This is a simplified mapping - in a real app, you'd use the backend mapping service
        const autoFilled: Set<string> = new Set();
        const initialValues: Record<string, string | boolean | number> = {};

        // Map policy number
        if (summary.policyNumber) {
          const fieldName = 'Your membership number if known';
          initialValues[fieldName] = summary.policyNumber;
          autoFilled.add(fieldName);
        }

        // Note: Other fields like member name, pet name, etc. would need to be extracted
        // from policy documents or provided by the user. For now, we only auto-fill
        // what we can get from the policy summary.

        setFormValues(initialValues);
        setAutoFilledFields(autoFilled);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load policy data. Please try again.';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAndMapPolicyData();

    return () => {
      isMounted = false;
    };
  }, [policyId, schema]);

  // Handle form field changes
  const handleFormChange = useCallback((values: Record<string, string | boolean | number>) => {
    setFormValues(values);
  }, []);

  // Convert form values to AdditionalFormData format
  const convertToAdditionalFormData = useCallback((): AdditionalFormData => {
    const additionalData: AdditionalFormData = {};

    // Map form values to AdditionalFormData structure
    // This mapping depends on the actual field names in the form
    Object.entries(formValues).forEach(([fieldName, value]) => {
      const name = fieldName.toLowerCase();

      if (name.includes('member') && name.includes('name')) {
        additionalData.memberName = String(value);
      } else if (name.includes('phone')) {
        additionalData.preferredPhone = String(value);
      } else if (name.includes('pet') && name.includes('name')) {
        additionalData.petName = String(value);
      } else if (name.includes('hospital')) {
        additionalData.hospitalName = String(value);
      } else if (name.includes('condition') && !name.includes('additional')) {
        additionalData.condition = String(value);
      } else if (name.includes('date') && name.includes('first')) {
        additionalData.dateOfFirstSigns = String(value);
      } else if (name.includes('birth')) {
        additionalData.petDateOfBirth = String(value);
      } else if (name.includes('submitted') && name.includes('previously')) {
        additionalData.hasSubmittedPreviously = value === true || value === 'true';
      } else if (name.includes('claim') && name.includes('number')) {
        additionalData.previousClaimNumber = String(value);
      } else if (name.includes('additional') && name.includes('condition')) {
        additionalData.additionalCondition = String(value);
      } else if (name.includes('prescription') && name.includes('food')) {
        additionalData.prescriptionFoodReview = value === true || value === 'Yes';
      } else if (name.includes('insured') && name.includes('elsewhere')) {
        additionalData.petInsuredElsewhere = value === true || value === 'true';
      } else if (name.includes('provider') && name.includes('name')) {
        additionalData.otherProviderName = String(value);
      } else if (name.includes('payment') || (name.includes('bill') && name.includes('full'))) {
        additionalData.paymentToVeterinarian = value === false || value === 'false';
      }
    });

    return additionalData;
  }, [formValues]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!policyId) {
      setError('Policy ID is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const additionalData = convertToAdditionalFormData();
      await claimApi.fillClaimForm(policyId, additionalData);

      // Success - PDF download is handled by the API
      // Optionally show a success message
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate PDF. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [policyId, convertToAdditionalFormData]);

  // No policy selected
  if (!policyId) {
    return (
      <SelectPolicy
        onSelect={(id) => {
          navigate(`/claims?policyId=${encodeURIComponent(id)}`);
        }}
      />
    );
  }

  // Loading state
  if (isLoading && !schema) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-slate-600">Loading form...</p>
      </div>
    );
  }

  // Error state
  if (error && !schema) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        <p className="font-semibold">Error loading form</p>
        <p className="mt-2 text-sm">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // No schema loaded
  if (!schema) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 to-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Trupanion Claim Form</h1>
        <p className="mt-2 text-sm text-slate-600">
          Fill out the claim form below. Fields marked with &quot;Auto-filled&quot; have been
          populated from your policy information.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Form or Preview */}
      {viewMode === 'edit' ? (
        <>
          <ClaimFormFields
            schema={schema}
            initialValues={formValues}
            autoFilledFields={autoFilledFields}
            onChange={handleFormChange}
            errors={{}}
          />
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setViewMode('preview')}>
              Review & Generate PDF
            </Button>
          </div>
        </>
      ) : (
        <>
          <ClaimFormPreview
            schema={schema}
            formValues={formValues}
            autoFilledFields={autoFilledFields}
            onEdit={() => setViewMode('edit')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </div>
  );
}

