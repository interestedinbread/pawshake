import { jsPDF } from 'jspdf';
import type { CoverageChecklist } from '../api/coverageApi';

/**
 * Generate a PDF from a claim checklist
 * @param checklist - The coverage checklist to convert to PDF
 * @param incidentDescription - The original incident description
 * @param policyName - Optional policy name to include in header
 */
export function generateChecklistPDF(
  checklist: CoverageChecklist,
  incidentDescription: string,
  policyName?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkPageBreak(fontSize + 2);
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5 + 2;
    });
    yPosition += 3; // Extra spacing after text block
  };

  // Helper function to add a section header
  const addSectionHeader = (title: string) => {
    checkPageBreak(15);
    yPosition += 5;
    addWrappedText(title, 14, true);
  };

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Claim Checklist', margin, yPosition);
  yPosition += 10;

  if (policyName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Policy: ${policyName}`, margin, yPosition);
    yPosition += 5;
  }

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPosition);
  yPosition += 10;
  doc.setTextColor(0, 0, 0);

  // Incident Description
  addSectionHeader('Incident Description');
  addWrappedText(incidentDescription, 10);

  // Summary
  addSectionHeader('Summary');
  addWrappedText(checklist.summary, 10);

  // Coverage Status
  addSectionHeader('Coverage Status');
  
  const coverageStatusText = 
    checklist.isCovered === true ? 'Covered' :
    checklist.isCovered === false ? 'Not Covered' :
    checklist.isCovered === 'partial' ? 'Partially Covered' :
    'Coverage Unclear';

  const statusColor = 
    checklist.isCovered === true ? [34, 197, 94] : // green
    checklist.isCovered === false ? [239, 68, 68] : // red
    checklist.isCovered === 'partial' ? [234, 179, 8] : // yellow
    [100, 100, 100]; // gray

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(coverageStatusText, margin, yPosition);
  yPosition += 6;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidence: ${checklist.confidence.charAt(0).toUpperCase() + checklist.confidence.slice(1)}`, margin, yPosition);
  yPosition += 6;

  if (checklist.estimatedCoverage?.percentage) {
    doc.text(`Estimated Coverage: ${checklist.estimatedCoverage.percentage}%`, margin, yPosition);
    yPosition += 6;
  }

  yPosition += 3;

  // Coverage Details
  addSectionHeader('Coverage Details');

  if (checklist.coverageDetails.coveredAspects.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Covered Aspects:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    checklist.coverageDetails.coveredAspects.forEach((aspect) => {
      doc.text(`  • ${aspect}`, margin + 5, yPosition);
      yPosition += 6;
      checkPageBreak(6);
    });
    yPosition += 2;
  }

  if (checklist.coverageDetails.excludedAspects && checklist.coverageDetails.excludedAspects.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Excluded Aspects:', margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    checklist.coverageDetails.excludedAspects.forEach((aspect) => {
      doc.text(`  • ${aspect}`, margin + 5, yPosition);
      yPosition += 6;
      checkPageBreak(6);
    });
    yPosition += 2;
  }

  if (checklist.coverageDetails.waitingPeriodApplies) {
    doc.text('⚠ Waiting period applies', margin, yPosition);
    yPosition += 6;
    checkPageBreak(6);
  }

  if (checklist.coverageDetails.deductibleApplies) {
    doc.text('⚠ Deductible applies', margin, yPosition);
    yPosition += 6;
    checkPageBreak(6);
  }

  if (checklist.coverageDetails.notes) {
    doc.text(`Note: ${checklist.coverageDetails.notes}`, margin, yPosition);
    yPosition += 6;
    checkPageBreak(6);
  }

  yPosition += 3;

  // Required Documents
  if (checklist.requiredDocuments.length > 0) {
    addSectionHeader('Required Documents');
    
    checklist.requiredDocuments.forEach((docItem, index) => {
      checkPageBreak(20);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${docItem.documentType}`, margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`   Description: ${docItem.description}`, margin + 5, yPosition);
      yPosition += 6;
      checkPageBreak(6);
      
      doc.text(`   Why Required: ${docItem.whyRequired}`, margin + 5, yPosition);
      yPosition += 6;
      checkPageBreak(6);
      
      if (docItem.deadline) {
        doc.setFont('helvetica', 'bold');
        doc.text(`   Deadline: ${docItem.deadline}`, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
        checkPageBreak(6);
      }
      
      yPosition += 3;
    });
  }

  // Action Steps
  if (checklist.actionSteps.length > 0) {
    addSectionHeader('Action Steps');
    
    // Sort by step number
    const sortedSteps = [...checklist.actionSteps].sort((a, b) => a.step - b.step);
    
    sortedSteps.forEach((step) => {
      checkPageBreak(20);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Step ${step.step}: ${step.action}`, margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`   Priority: ${step.priority.charAt(0).toUpperCase() + step.priority.slice(1)}`, margin + 5, yPosition);
      yPosition += 6;
      checkPageBreak(6);
      doc.setTextColor(0, 0, 0);
      
      if (step.deadline) {
        doc.setFont('helvetica', 'bold');
        doc.text(`   Deadline: ${step.deadline}`, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
        checkPageBreak(6);
      }
      
      if (step.policyReference?.pageNumber) {
        doc.text(`   Policy Reference: Page ${step.policyReference.pageNumber}`, margin + 5, yPosition);
        yPosition += 6;
        checkPageBreak(6);
      }
      
      yPosition += 3;
    });
  }

  // Warnings
  if (checklist.warnings && checklist.warnings.length > 0) {
    addSectionHeader('Warnings');
    doc.setTextColor(239, 68, 68); // red
    checklist.warnings.forEach((warning) => {
      doc.text(`⚠ ${warning}`, margin, yPosition);
      yPosition += 6;
      checkPageBreak(6);
    });
    doc.setTextColor(0, 0, 0);
    yPosition += 3;
  }

  // Estimated Coverage Details
  if (checklist.estimatedCoverage?.notes) {
    addSectionHeader('Estimated Coverage Notes');
    addWrappedText(checklist.estimatedCoverage.notes, 10);
  }

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `claim-checklist-${dateStr}-${timeStr}.pdf`;

  // Save the PDF
  doc.save(filename);
}

