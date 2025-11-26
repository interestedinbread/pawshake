import { pdf } from '@react-pdf/renderer';
import { ChecklistPDFDocument } from '../components/pdf/ChecklistPDFDocument';
import type { CoverageChecklist } from '../api/coverageApi';

/**
 * Generate a PDF from a claim checklist using React PDF renderer
 * @param checklist - The coverage checklist data
 * @param incidentDescription - The original incident description
 * @param policyName - Optional policy name to include in header
 */
export async function generateChecklistPDF(
  checklist: CoverageChecklist,
  incidentDescription: string,
  policyName?: string
): Promise<void> {
  // Create the PDF document using JSX
  const doc = (
    <ChecklistPDFDocument
      checklist={checklist}
      incidentDescription={incidentDescription}
      policyName={policyName}
    />
  );

  // Generate PDF blob
  const blob = await pdf(doc).toBlob();

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `claim-checklist-${dateStr}-${timeStr}.pdf`;

  // Create download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

