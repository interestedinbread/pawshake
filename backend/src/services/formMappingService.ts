import { PolicySummary } from '../types/policySummary';
import { FormField } from './formExtractionService';

/**
 * Maps policy summary data to Trupanion claim form fields
 * @param policySummary - The extracted policy summary
 * @param additionalData - Additional data provided by user (pet name, member name, etc.)
 * @returns Object mapping form field names to values
 */
export interface FormMappingData {
  [fieldName: string]: string | boolean | number | undefined;
}

export interface AdditionalFormData {
  memberName?: string;
  preferredPhone?: string;
  petName?: string;
  hospitalName?: string;
  condition?: string;
  dateOfFirstSigns?: string; // Format: MM/DD/YY
  petDateOfBirth?: string; // Format: MM/DD/YY
  hasSubmittedPreviously?: boolean;
  previousClaimNumber?: string;
  additionalCondition?: string;
  prescriptionFoodReview?: boolean;
  petInsuredElsewhere?: boolean;
  otherProviderName?: string;
  paymentToVeterinarian?: boolean;
}

/**
 * Map policy summary and additional data to form field values
 * @param policySummary - Policy summary data
 * @param additionalData - User-provided claim-specific data
 * @returns Mapping of form field names to values
 */
export function mapPolicyToFormFields(
  policySummary: PolicySummary,
  additionalData: AdditionalFormData = {}
): FormMappingData {
  const formData: FormMappingData = {};

  // Map policy number to membership number
  if (policySummary.policyNumber) {
    formData['Your membership number if known'] = policySummary.policyNumber;
  }

  // Map member name (from additional data or try to extract from policy)
  if (additionalData.memberName) {
    formData['Member name'] = additionalData.memberName;
  }

  // Map preferred phone
  if (additionalData.preferredPhone) {
    formData['Preferred phone'] = additionalData.preferredPhone;
  }

  // Map pet name
  if (additionalData.petName) {
    formData['Your pets name please complete one form per pet'] = additionalData.petName;
  }

  // Map hospital name
  if (additionalData.hospitalName) {
    formData['Hospital name'] = additionalData.hospitalName;
  }

  // Map condition
  if (additionalData.condition) {
    formData['Condition'] = additionalData.condition;
  }

  // Map date of first signs
  if (additionalData.dateOfFirstSigns) {
    // The form has separate fields for MM, DD, YY - we'll need to parse the date
    // For now, store the full date string - the fillForm function will need to handle parsing
    formData['If no date of first signs'] = additionalData.dateOfFirstSigns;
  }

  // Map previous submission checkbox
  if (additionalData.hasSubmittedPreviously !== undefined) {
    formData['Have you submitted an invoice for this condition previously'] = additionalData.hasSubmittedPreviously;
  }

  // Map previous claim number
  if (additionalData.previousClaimNumber) {
    formData['If yes claim number'] = additionalData.previousClaimNumber;
  }

  // Map additional condition
  if (additionalData.additionalCondition) {
    // This is a radio button field - need to check the exact option value
    formData['Additional condition if applicable'] = additionalData.additionalCondition;
  }

  // Map prescription food review (Yes/No)
  if (additionalData.prescriptionFoodReview !== undefined) {
    // The form has a radio button with "Yes" and "No" options
    // Field name from extraction: "undefined_3" with options ["Yes", "No"]
    // We'll need to map this correctly based on the actual field name
    formData['undefined_3'] = additionalData.prescriptionFoodReview ? 'Yes' : 'No';
  }

  // Map pet date of birth
  if (additionalData.petDateOfBirth) {
    formData['Date of birth'] = additionalData.petDateOfBirth;
  }

  // Map pet insured elsewhere
  if (additionalData.petInsuredElsewhere !== undefined) {
    // Field: "Yes_2" checkbox
    formData['Yes_2'] = additionalData.petInsuredElsewhere;
  }

  // Map other provider name
  if (additionalData.otherProviderName) {
    formData['If yes provider name'] = additionalData.otherProviderName;
  }

  // Map payment preference
  if (additionalData.paymentToVeterinarian !== undefined) {
    // Field: "I have paid my bill in full Pay me by my selected" checkbox
    // If false, payment goes to veterinarian
    formData['I have paid my bill in full Pay me by my selected'] = !additionalData.paymentToVeterinarian;
  }

  return formData;
}

/**
 * Get a list of form fields that can be auto-filled from policy data
 * @param policySummary - Policy summary data
 * @returns Array of field names that can be auto-filled
 */
export function getAutoFillableFields(policySummary: PolicySummary): string[] {
  const autoFillable: string[] = [];

  if (policySummary.policyNumber) {
    autoFillable.push('Your membership number if known');
  }

  // Note: Member name, pet name, etc. would need to be extracted from documents
  // or provided by user, so they're not truly "auto-fillable" from policy summary alone

  return autoFillable;
}

/**
 * Get a list of required fields that must be provided by the user
 * @returns Array of field names that are required for claim submission
 */
export function getRequiredFields(): string[] {
  return [
    'Member name',
    'Your pets name please complete one form per pet',
    'Hospital name',
    'Condition',
    'If no date of first signs',
  ];
}

