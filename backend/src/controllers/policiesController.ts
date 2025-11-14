/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express'
import { db } from '../db/db'

export const createPolicy = async (req: Request, res: Response) => {

    try{
        const { name, description } = req.body
        const user_id = req.userId

        if(!user_id){
            res.status(400).json({ error: 'User ID required'})
            return
        }
        
        if(!name || name.trim() === ''){
            res.status(400).json({ error: "Name is required"})
            return
        }

        const policyQuery = `
        INSERT INTO policies (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, created_at, updated_at;
        `

        const response = await db.query(policyQuery, [user_id, name, description || null])
        res.status(201).json({ result: response.rows[0]})

    } catch (err) {
        console.error('Error creating policy:', err)
        res.status(500).json({
            error: 'Failed to create policy',
            message: err instanceof Error ? err.message : 'Unknown error',
          });
    }
}

export const updatePolicyName = async (req: Request, res: Response) => {
    try{
        const { policyId } = req.params
        const { name } = req.body
        const userId = req.userId

        if(!userId){
            res.status(401).json({ error: 'User not authenticated'})
            return 
        }

        if(!policyId){
            res.status(400).json({ error: "Policy ID is required"})
            return 
        }

        if(!name || name.trim() === ''){
            res.status(400).json({ error: "Name is required"})
            return
        }

        // Check if policy exists and belongs to user
        const policyCheckQuery = `
        SELECT id FROM policies WHERE id = $1 AND user_id = $2
        `

        const policyCheckResult = await db.query(policyCheckQuery, [policyId, userId])

        if(policyCheckResult.rows.length === 0){
            res.status(404).json({ error: 'Policy not found'})
            return
        }

        // Update the policy name
        const updateQuery = `
        UPDATE policies 
        SET name = $1, updated_at = now()
        WHERE id = $2 AND user_id = $3
        RETURNING id, name, description, created_at, updated_at;
        `

        const updateResult = await db.query(updateQuery, [name.trim(), policyId, userId])
        res.status(200).json({ policy: updateResult.rows[0]})
    } catch (err) {
        console.error('Failed to update policy name', err)
        res.status(500).json({
            error: 'Failed to update policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        })
    }
}

export const deletePolicy = async (req: Request, res:Response) => {
    try{
        const { policyId } = req.params
        const userId = req.userId

        if(!policyId){
            res.status(400).json({ error: 'Policy ID required'})
            return
        }

        if(!userId || userId.trim() === ''){
            res.status(400).json({ error: 'User ID required'})
            return
        }

        // Check if policy exists and belongs to user
        const policyCheckQuery = `
        SELECT id FROM policies WHERE id = $1 AND user_id = $2
        `

        const policyCheckResult = await db.query(policyCheckQuery, [policyId, userId])

        if(policyCheckResult.rows.length === 0){
            res.status(404).json({ error: 'Policy not found'})
            return
        }

        const deleteQuery = `
            DELETE FROM policies WHERE id = $1 AND user_id = $2
        `

        const result = await db.query(deleteQuery, [policyId, userId])
        res.status(200).json({ result: result.rowCount })
    } catch (err) {
        console.error('Failed to delete policy', err)
        res.status(500).json({
            error: 'Failed to delete policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        })
    }
}