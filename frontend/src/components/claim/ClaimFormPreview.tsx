import type { FormSchema } from '../../api/claimApi';
import { Button } from '../common/Button';

interface ClaimFormPreviewProps {
  schema: FormSchema;
  formValues: Record<string, string | boolean | number>;
  autoFilledFields?: Set<string>;
  onEdit?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

/**
 * Format a value for display
 */
function formatValue(value: string | boolean | number | undefined): string {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return String(value);
}

/**
 * Get a user-friendly label for a field name
 */
function getFieldLabel(fieldName: string): string {
  // Clean up field names for display while preserving important context
  let cleaned = fieldName
    // Remove filler words that don't add meaning
    .replace(/\bif\b/gi, '')
    .replace(/\bplease\b/gi, '')
    .replace(/\bcomplete\b/gi, '')
    .replace(/\bone\b/gi, '')
    .replace(/\bform\b/gi, '')
    .replace(/\bper\b/gi, '')
    .replace(/\bapplicable\b/gi, '')
    .replace(/\bknown\b/gi, '')
    .replace(/\bundefined\b/gi, '')
    // Remove underscores and numbers
    .replace(/[_\d]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  cleaned = cleaned.replace(/^./, (char) => char.toUpperCase());

  // Handle specific common patterns
  // "Your pets name" -> "Pet's name"
  cleaned = cleaned.replace(/\byour\s+pets?\s+name\b/gi, "Pet's name");
  // "Your name" (when it's actually about pet) -> keep as is, but we'll check context
  // "Member name" -> "Member name" (keep as is)
  
  return cleaned;
}

/**
 * Group fields into sections for preview display
 */
function groupFieldsForPreview(
  schema: FormSchema,
  formValues: Record<string, string | boolean | number>
) {
  const sections: Record<string, Array<{ label: string; value: string; fieldName: string }>> = {
    member: [],
    pet: [],
    claim: [],
    payment: [],
    other: [],
  };

  schema.fields.forEach((field) => {
    const value = formValues[field.name];
    // Skip empty values in preview
    if (value === undefined || value === null || value === '') {
      return;
    }

    const label = getFieldLabel(field.name);
    const displayValue = formatValue(value);
    const entry = { label, value: displayValue, fieldName: field.name };

    const name = field.name.toLowerCase();

    if (name.includes('member') || name.includes('membership') || name.includes('phone')) {
      sections.member.push(entry);
    } else if (
      name.includes('pet') ||
      name.includes('birth') ||
      name.includes('insured') ||
      name.includes('provider')
    ) {
      sections.pet.push(entry);
    } else if (
      name.includes('hospital') ||
      name.includes('condition') ||
      name.includes('claim') ||
      name.includes('invoice') ||
      name.includes('treatment') ||
      name.includes('signs') ||
      name.includes('prescription')
    ) {
      sections.claim.push(entry);
    } else if (name.includes('payment') || name.includes('bill') || name.includes('pay')) {
      sections.payment.push(entry);
    } else {
      sections.other.push(entry);
    }
  });

  // Remove empty sections
  return Object.entries(sections).filter(([, entries]) => entries.length > 0);
}

export function ClaimFormPreview({
  schema,
  formValues,
  autoFilledFields = new Set(),
  onEdit,
  onSubmit,
  isSubmitting = false,
}: ClaimFormPreviewProps) {
  const fieldSections = groupFieldsForPreview(schema, formValues);

  const sectionTitles: Record<string, string> = {
    member: 'Member Information',
    pet: 'Pet Information',
    claim: 'Claim Details',
    payment: 'Payment Information',
    other: 'Additional Information',
  };

  const hasData = fieldSections.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Review Your Claim Form</h2>
            <p className="mt-1 text-sm text-slate-600">
              Please review the information below. Click &quot;Edit&quot; to make changes, or
              &quot;Generate PDF&quot; to download your completed form.
            </p>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-amber-800">No form data to preview. Please fill out the form first.</p>
        </div>
      ) : (
        fieldSections.map(([sectionKey, entries]) => (
          <section
            key={sectionKey}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <header className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {sectionTitles[sectionKey] || 'Information'}
              </h3>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              {entries.map(({ label, value, fieldName }) => {
                const isAutoFilled = autoFilledFields.has(fieldName);
                return (
                  <div key={fieldName} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      {isAutoFilled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Auto-filled
                        </span>
                      )}
                    </div>
                    <p className="text-base text-slate-900">{value}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {hasData && onSubmit && (
        <div className="flex justify-end gap-3">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Form
            </Button>
          )}
          <Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>
            Generate PDF
          </Button>
        </div>
      )}
    </div>
  );
}

