import { Request, Response } from 'express';
import { db } from '../db/db';
import { analyzeIncidentCoverage } from '../services/coverageChecklistService';
import logger from '../utils/logger';

/**
 * Handle coverage analysis for an incident.
 *
 * Route: POST /api/policies/:policyId/coverage-check
 *
 * Expected body:
 * {
 *   "incidentDescription": "My dog broke his leg playing fetch"
 * }
 *
 * Response:
 * CoverageChecklist object with isCovered, confidence, requiredDocuments, actionSteps, etc.
 */
export const checkCoverage = async (req: Request, res: Response): Promise<void> => {
  try {

 
    const userId = req.userId;

    // if there's no userId...
    if(!userId){
        res.status(400).json({ error: 'User ID missing'});
        return;
    }

    // grab policyId...
    const policyId = req.params.policyId;

    // if there's no policyId...
    if(!policyId){
        res.status(400).json({ 
            error: 'Policy ID is required',
            message: 'Provide Policy ID as a route parameter'
        })
        return;
    }

    // grab incident description...
    const { incidentDescription } = req.body;

    // Validate incident description
    if(!incidentDescription || typeof incidentDescription !== 'string' || incidentDescription.trim() === ''){
        res.status(400).json({
            error: 'No incident description provided',
            message: 'Provide incident description in request body as a non-empty string'
        })
        return;
    }

    // Verify policy exists and belongs to the authenticated user
    const policyQuery = `
    SELECT id, name
    FROM policies
    WHERE id = $1 AND user_id = $2
    `;

    // run the db query and store in const
    const queryResult = await db.query(policyQuery, [policyId, userId]);

    // check if query result contains anything
    if(queryResult.rows.length === 0){
        res.status(404).json({
            error: 'Policy not found or access denied'
        });
        return;
    }

    // Delegate to coverage checklist service to analyze the incident
    const checklist = await analyzeIncidentCoverage(policyId, incidentDescription.trim());

    res.status(200).json(checklist);
  } catch (err) {
    logger.error('Error checking coverage', {
      policyId: req.params.policyId || 'unknown',
      userId: req.userId || 'unknown',
      incidentDescription: req.body?.incidentDescription?.substring(0, 100) || 'unknown', // Log first 100 chars
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });
    res.status(500).json({
      error: 'Failed to analyze coverage',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

