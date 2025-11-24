import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a PDF from a claim checklist by capturing the rendered UI component
 * @param checklistElementId - The ID of the DOM element containing the checklist card
 * @param incidentDescription - The original incident description
 * @param policyName - Optional policy name to include in header
 */
export async function generateChecklistPDF(
  checklistElementId: string,
  incidentDescription: string,
  policyName?: string
): Promise<void> {
  // Find the checklist element
  const element = document.getElementById(checklistElementId);
  if (!element) {
    throw new Error('Checklist element not found');
  }

  // Capture the element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  // Create PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Calculate dimensions
  const imgWidth = pdfWidth - 2 * margin;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add header section
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Claim Checklist', margin, margin);

  let yPosition = margin + 10;

  if (policyName) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Policy: ${policyName}`, margin, yPosition);
    yPosition += 6;
  }

  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += 8;
  pdf.setTextColor(0, 0, 0);

  // Add incident description section
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Incident Description', margin, yPosition);
  yPosition += 6;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const descriptionLines = pdf.splitTextToSize(incidentDescription, imgWidth);
  descriptionLines.forEach((line: string) => {
    if (yPosition + 5 > pdfHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Add the captured checklist image
  // If image is too tall, split across pages
  let remainingHeight = imgHeight;
  let sourceY = 0;

  while (remainingHeight > 0) {
    // Check if we need a new page
    if (yPosition + 10 > pdfHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    // Calculate how much of the image fits on this page
    const availableHeight = pdfHeight - margin - yPosition;
    const heightToAdd = Math.min(remainingHeight, availableHeight);
    const sourceHeight = (heightToAdd / imgHeight) * canvas.height;

    // Create a temporary canvas for this portion
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = sourceHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
      const portionImgData = tempCanvas.toDataURL('image/png');

      // Add image portion to PDF
      pdf.addImage(portionImgData, 'PNG', margin, yPosition, imgWidth, heightToAdd);
    }

    yPosition += heightToAdd + 5;
    sourceY += sourceHeight;
    remainingHeight -= heightToAdd;
  }

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `claim-checklist-${dateStr}-${timeStr}.pdf`;

  // Save the PDF
  pdf.save(filename);
}
