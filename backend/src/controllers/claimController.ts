/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { getTrupanionFormSchema, fillForm } from '../services/formExtractionService';
import { mapPolicyToFormFields, AdditionalFormData } from '../services/formMappingService';
import { getPolicySummary } from './documentController';
import { db } from '../db/db';

/**
 * Get the Trupanion claim form schema
 * Returns the structure of all form fields
 */
export const getFormSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = await getTrupanionFormSchema();
    res.status(200).json(schema);
  } catch (error) {
    console.error('Error fetching form schema:', error);
    res.status(500).json({
      error: 'Failed to fetch form schema',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Fill the Trupanion claim form with policy data
 * POST /api/claims/form/fill
 * Body: { policyId, additionalData: { memberName, petName, hospitalName, condition, ... } }
 */
export const fillClaimForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { policyId, additionalData } = req.body as {
      policyId: string;
      additionalData?: AdditionalFormData;
    };

    if (!policyId) {
      res.status(400).json({ error: 'Policy ID is required' });
      return;
    }

    // Verify policy exists and belongs to user
    const policyCheck = await db.query(
      `SELECT id, name FROM policies WHERE id = $1 AND user_id = $2`,
      [policyId, userId]
    );

    if (policyCheck.rows.length === 0) {
      res.status(404).json({ error: 'Policy not found or access denied' });
      return;
    }

    // Get policy summary
    // We'll need to fetch it directly since getPolicySummary is a controller function
    const summaryQuery = `
      SELECT ps.summary_data
      FROM policy_summaries ps
      INNER JOIN policies p ON ps.policy_id = p.id
      WHERE ps.policy_id = $1 AND p.user_id = $2
    `;

    const summaryResult = await db.query(summaryQuery, [policyId, userId]);

    if (summaryResult.rows.length === 0) {
      res.status(404).json({
        error: 'Policy summary not found',
        message: 'Please ensure your policy has been processed and a summary is available.',
      });
      return;
    }

    const summaryData =
      typeof summaryResult.rows[0].summary_data === 'string'
        ? JSON.parse(summaryResult.rows[0].summary_data)
        : summaryResult.rows[0].summary_data;

    // Map policy data to form fields
    const formData = mapPolicyToFormFields(summaryData, additionalData || {});

    // Load the template form and fill it
    const path = require('path');
    const fs = require('fs');
    const formPath = path.join(__dirname, '../../test-data/Claim-Payout-Request-Form_0223_EDITABLE.pdf');
    
    if (!fs.existsSync(formPath)) {
      res.status(500).json({ error: 'Form template not found' });
      return;
    }

    const pdfBuffer = fs.readFileSync(formPath);
    const filledPdfBuffer = await fillForm(pdfBuffer, formData);

    // Return the filled PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="trupanion-claim-form-filled.pdf"');
    res.status(200).send(filledPdfBuffer);
  } catch (error) {
    console.error('Error filling claim form:', error);
    res.status(500).json({
      error: 'Failed to fill claim form',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

