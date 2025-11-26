import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CoverageChecklist } from '../../api/coverageApi';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  summaryBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 10,
    color: '#1e40af',
    lineHeight: 1.5,
  },
  statusCard: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  statusCardCovered: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  statusCardNotCovered: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  statusCardPartial: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  statusCardUnclear: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  confidenceBadge: {
    backgroundColor: '#e0e7ff',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 8,
    color: '#4338ca',
    textTransform: 'uppercase',
  },
  coverageDetails: {
    marginTop: 10,
  },
  aspectList: {
    marginTop: 6,
    marginLeft: 10,
  },
  aspectItem: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9,
    color: '#475569',
  },
  checkmark: {
    marginRight: 6,
    fontSize: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  badge: {
    backgroundColor: '#fef3c7',
    padding: '4px 8px',
    borderRadius: 12,
    fontSize: 8,
    color: '#92400e',
  },
  estimatedCoverage: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  estimatedPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#fcd34d',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  warningTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9,
    color: '#78350f',
  },
  documentCard: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  documentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  documentText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
    lineHeight: 1.4,
  },
  documentDeadline: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  stepContent: {
    flex: 1,
  },
  stepAction: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepMeta: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  priorityBadge: {
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 7,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  priorityHigh: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  priorityLow: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
  },
});

interface ChecklistPDFDocumentProps {
  checklist: CoverageChecklist;
  incidentDescription: string;
  policyName?: string;
}

const getStatusStyle = (status: CoverageChecklist['isCovered']) => {
  if (status === true) return styles.statusCardCovered;
  if (status === false) return styles.statusCardNotCovered;
  if (status === 'partial') return styles.statusCardPartial;
  return styles.statusCardUnclear;
};

const getStatusIcon = (status: CoverageChecklist['isCovered']) => {
  if (status === true) return '✓';
  if (status === false) return '✗';
  if (status === 'partial') return '⚠';
  return '?';
};

const getStatusLabel = (status: CoverageChecklist['isCovered']) => {
  if (status === true) return 'Covered';
  if (status === false) return 'Not Covered';
  if (status === 'partial') return 'Partially Covered';
  return 'Coverage Unclear';
};

export const ChecklistPDFDocument: React.FC<ChecklistPDFDocumentProps> = ({
  checklist,
  incidentDescription,
  policyName,
}) => {
  const statusStyle = getStatusStyle(checklist.isCovered);
  const statusIcon = getStatusIcon(checklist.isCovered);
  const statusLabel = getStatusLabel(checklist.isCovered);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Claim Checklist</Text>
          {policyName && <Text style={styles.subtitle}>Policy: {policyName}</Text>}
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Text>
        </View>

        {/* Incident Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Description</Text>
          <Text style={styles.summaryText}>{incidentDescription}</Text>
        </View>

        {/* Summary */}
        {checklist.summary && (
          <View style={styles.section}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{checklist.summary}</Text>
            </View>
          </View>
        )}

        {/* Coverage Status */}
        <View style={[styles.statusCard, statusStyle]}>
          <View style={styles.statusHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.statusIcon}>{statusIcon}</Text>
              <Text style={styles.statusLabel}>{statusLabel}</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Text>{checklist.confidence} confidence</Text>
            </View>
          </View>

          <View style={styles.coverageDetails}>
            {/* Covered Aspects */}
            {checklist.coverageDetails.coveredAspects.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569', marginBottom: 4 }}>
                  Covered aspects:
                </Text>
                {checklist.coverageDetails.coveredAspects.map((aspect, idx) => (
                  <View key={idx} style={styles.aspectItem}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text>{aspect}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Excluded Aspects */}
            {checklist.coverageDetails.excludedAspects &&
              checklist.coverageDetails.excludedAspects.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569', marginBottom: 4 }}>
                    Excluded aspects:
                  </Text>
                  {checklist.coverageDetails.excludedAspects.map((aspect, idx) => (
                    <View key={idx} style={styles.aspectItem}>
                      <Text style={[styles.checkmark, { color: '#dc2626' }]}>✗</Text>
                      <Text>{aspect}</Text>
                    </View>
                  ))}
                </View>
              )}

            {/* Badges */}
            <View style={styles.badgeContainer}>
              {checklist.coverageDetails.waitingPeriodApplies && (
                <View style={styles.badge}>
                  <Text>⏱ Waiting period applies</Text>
                </View>
              )}
              {checklist.coverageDetails.deductibleApplies && (
                <View style={styles.badge}>
                  <Text>💰 Deductible applies</Text>
                </View>
              )}
            </View>

            {/* Estimated Coverage */}
            {checklist.estimatedCoverage && (
              <View style={styles.estimatedCoverage}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569' }}>
                  Estimated reimbursement:
                </Text>
                {checklist.estimatedCoverage.percentage !== undefined ? (
                  <Text style={styles.estimatedPercentage}>
                    {checklist.estimatedCoverage.percentage}%
                  </Text>
                ) : (
                  <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>
                    See policy details
                  </Text>
                )}
                {checklist.estimatedCoverage.notes && (
                  <Text style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>
                    {checklist.estimatedCoverage.notes}
                  </Text>
                )}
              </View>
            )}

            {/* Warnings */}
            {checklist.warnings && checklist.warnings.length > 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>Important warnings:</Text>
                {checklist.warnings.map((warning, idx) => (
                  <View key={idx} style={styles.warningItem}>
                    <Text>⚠ </Text>
                    <Text>{warning}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Required Documents */}
        {checklist.requiredDocuments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            {checklist.requiredDocuments.map((doc, idx) => (
              <View key={idx} style={styles.documentCard}>
                <Text style={styles.documentTitle}>
                  {idx + 1}. {doc.documentType}
                </Text>
                <Text style={styles.documentText}>Description: {doc.description}</Text>
                <Text style={styles.documentText}>Why Required: {doc.whyRequired}</Text>
                {doc.deadline && (
                  <Text style={styles.documentDeadline}>Deadline: {doc.deadline}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Steps */}
        {checklist.actionSteps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Steps</Text>
            {[...checklist.actionSteps]
              .sort((a, b) => a.step - b.step)
              .map((step, idx) => (
                <View key={idx} style={styles.stepContainer}>
                  <View style={styles.stepNumber}>
                    <Text>{step.step}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={styles.stepAction}>{step.action}</Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          step.priority === 'high'
                            ? styles.priorityHigh
                            : step.priority === 'medium'
                              ? styles.priorityMedium
                              : styles.priorityLow,
                        ]}
                      >
                        <Text style={{ fontSize: 7, textTransform: 'uppercase' }}>
                          {step.priority}
                        </Text>
                      </View>
                    </View>
                    {step.deadline && (
                      <Text style={styles.stepMeta}>Deadline: {step.deadline}</Text>
                    )}
                    {step.policyReference?.pageNumber && (
                      <Text style={styles.stepMeta}>
                        Policy Reference: Page {step.policyReference.pageNumber}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

