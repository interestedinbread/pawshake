import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'unknown';
  required?: boolean;
  defaultValue?: string;
  options?: string[]; // For dropdowns/radio buttons
}

export interface FormSchema {
  fields: FormField[];
  formName: string;
  pageCount: number;
}

/**
 * Extract form field structure from a PDF form
 * @param pdfBuffer - PDF file as Buffer
 * @returns Form schema with all fields and their properties
 */
export async function extractFormFields(pdfBuffer: Buffer): Promise<FormSchema> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const extractedFields: FormField[] = [];

    for (const field of fields) {
      const fieldName = field.getName();
      let fieldType: FormField['type'] = 'unknown';
      let defaultValue: string | undefined;
      let options: string[] | undefined;

      // Determine field type and extract properties using proper type checking
      if (field instanceof PDFTextField) {
        fieldType = 'text';
        const textValue = field.getText();
        if (textValue && textValue.trim().length > 0) {
          defaultValue = textValue;
        }
      } else if (field instanceof PDFCheckBox) {
        fieldType = 'checkbox';
        if (field.isChecked()) {
          defaultValue = 'true';
        }
      } else if (field instanceof PDFRadioGroup) {
        fieldType = 'radio';
        options = field.getOptions();
        const selected = field.getSelected();
        if (selected) {
          defaultValue = selected;
        }
      } else if (field instanceof PDFDropdown) {
        fieldType = 'dropdown';
        options = field.getOptions();
        const selected = field.getSelected();
        if (selected && selected.length > 0) {
          defaultValue = selected[0]; // Dropdowns can have multiple selections, take first
        }
      }

      const formField: FormField = {
        name: fieldName,
        type: fieldType,
      };

      if (defaultValue !== undefined) {
        formField.defaultValue = defaultValue;
      }

      if (options !== undefined && options.length > 0) {
        formField.options = options;
      }

      extractedFields.push(formField);
    }

    return {
      fields: extractedFields,
      formName: 'Trupanion Claim Form',
      pageCount: pdfDoc.getPageCount(),
    };
  } catch (error) {
    throw new Error(
      `Failed to extract form fields: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Load the Trupanion claim form template and extract its structure
 * @returns Form schema for the Trupanion claim form
 */
export async function getTrupanionFormSchema(): Promise<FormSchema> {
  try {
    // Path to the Trupanion form template
    const formPath = path.join(__dirname, '../../test-data/Claim-Payout-Request-Form_0223_EDITABLE.pdf');
    
    if (!fs.existsSync(formPath)) {
      throw new Error(`Trupanion form template not found at: ${formPath}`);
    }

    const pdfBuffer = fs.readFileSync(formPath);
    return await extractFormFields(pdfBuffer);
  } catch (error) {
    throw new Error(
      `Failed to load Trupanion form schema: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fill a PDF form with provided data
 * @param pdfBuffer - Original PDF form as Buffer
 * @param formData - Object mapping field names to values
 * @returns Filled PDF as Buffer
 */
export async function fillForm(
  pdfBuffer: Buffer,
  formData: Record<string, string | boolean | number | undefined>
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    for (const field of fields) {
      const fieldName = field.getName();
      const value = formData[fieldName];

      if (value === undefined || value === null) {
        continue; // Skip fields not in formData
      }

      try {
        // Fill field based on type using proper type checking
        if (field instanceof PDFTextField) {
          field.setText(String(value));
        } else if (field instanceof PDFCheckBox) {
          if (typeof value === 'boolean') {
            if (value) {
              field.check();
            } else {
              field.uncheck();
            }
          } else if (String(value).toLowerCase() === 'true' || value === 'Yes') {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (field instanceof PDFRadioGroup) {
          field.select(String(value));
        } else if (field instanceof PDFDropdown) {
          field.select(String(value));
        }
      } catch (fieldError) {
        // Log but continue - some fields might not be fillable
        console.warn(`Failed to fill field "${fieldName}":`, fieldError);
      }
    }

    // Generate filled PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    throw new Error(
      `Failed to fill form: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

