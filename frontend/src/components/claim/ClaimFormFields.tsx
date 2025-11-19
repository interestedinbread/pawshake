import { useState, useEffect, useCallback } from 'react';
import type { FormSchema, FormField } from '../../api/claimApi';
import { FormFieldInput } from './FormFieldInput';

interface ClaimFormFieldsProps {
  schema: FormSchema;
  initialValues?: Record<string, string | boolean | number>;
  autoFilledFields?: Set<string>;
  onChange?: (values: Record<string, string | boolean | number>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * Component that renders all form fields from the schema
 * Manages form state and tracks auto-filled fields
 */
export function ClaimFormFields({
  schema,
  initialValues = {},
  autoFilledFields = new Set(),
  onChange,
  errors = {},
  disabled = false,
}: ClaimFormFieldsProps) {
  // Form state: field name -> value
  const [formValues, setFormValues] = useState<Record<string, string | boolean | number>>(
    initialValues
  );

  // Update form values when initialValues change (e.g., when policy data loads)
  useEffect(() => {
    setFormValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  // Handle field value changes
  const handleFieldChange = useCallback(
    (fieldName: string, value: string | boolean | number) => {
      setFormValues((prev) => {
        const updated = { ...prev, [fieldName]: value };
        // Notify parent component of changes
        if (onChange) {
          onChange(updated);
        }
        return updated;
      });
    },
    [onChange]
  );

  // Group fields into logical sections based on field names
  const groupFields = (fields: FormField[]) => {
    const sections: Record<string, FormField[]> = {
      member: [],
      pet: [],
      claim: [],
      payment: [],
      other: [],
    };

    fields.forEach((field) => {
      const name = field.name.toLowerCase();
      
      if (name.includes('member') || name.includes('membership') || name.includes('phone')) {
        sections.member.push(field);
      } else if (
        name.includes('pet') ||
        name.includes('birth') ||
        name.includes('insured') ||
        name.includes('provider')
      ) {
        sections.pet.push(field);
      } else if (
        name.includes('hospital') ||
        name.includes('condition') ||
        name.includes('claim') ||
        name.includes('invoice') ||
        name.includes('treatment') ||
        name.includes('signs') ||
        name.includes('prescription')
      ) {
        sections.claim.push(field);
      } else if (name.includes('payment') || name.includes('bill') || name.includes('pay')) {
        sections.payment.push(field);
      } else {
        sections.other.push(field);
      }
    });

    // Remove empty sections
    return Object.entries(sections).filter(([, fields]) => fields.length > 0);
  };

  const fieldSections = groupFields(schema.fields);

  // Section titles
  const sectionTitles: Record<string, string> = {
    member: 'Member Information',
    pet: 'Pet Information',
    claim: 'Claim Details',
    payment: 'Payment Information',
    other: 'Additional Information',
  };

  return (
    <div className="space-y-6">
      {fieldSections.map(([sectionKey, fields]) => (
        <section
          key={sectionKey}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <header className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {sectionTitles[sectionKey] || 'Information'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {sectionKey === 'member' && 'Your contact and membership information'}
              {sectionKey === 'pet' && 'Details about your pet'}
              {sectionKey === 'claim' && 'Information about the veterinary visit and condition'}
              {sectionKey === 'payment' && 'How you would like to receive payment'}
              {sectionKey === 'other' && 'Additional details'}
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const fieldValue = formValues[field.name];
              const isAutoFilled = autoFilledFields.has(field.name);
              const fieldError = errors[field.name];

              return (
                <div key={field.name} className={field.type === 'checkbox' ? 'md:col-span-2' : ''}>
                  <FormFieldInput
                    field={field}
                    value={fieldValue}
                    onChange={(value) => handleFieldChange(field.name, value)}
                    isAutoFilled={isAutoFilled}
                    error={fieldError}
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

