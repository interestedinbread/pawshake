/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express'
import { db } from '../db/db'
import { deleteChunksByPolicyId } from '../services/vectorService'

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

        // Get document count before deletion (for response)
        const docCountResult = await db.query(
            'SELECT COUNT(*) as count FROM documents WHERE policy_id = $1',
            [policyId]
        )
        const documentCount = Number(docCountResult.rows[0]?.count || 0)

        // Delete ChromaDB embeddings for this policy
        let deletedChunks = 0
        try {
            deletedChunks = await deleteChunksByPolicyId(policyId)
        } catch (chromaError) {
            // Log error but don't fail the deletion
            // Database deletion will still proceed
            console.warn('Failed to delete ChromaDB chunks (database deletion will proceed):', chromaError)
        }

        // Delete policy from database (CASCADE will delete documents and summaries)
        const deleteQuery = `
            DELETE FROM policies WHERE id = $1 AND user_id = $2
        `

        const result = await db.query(deleteQuery, [policyId, userId])
        
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Policy not found' })
            return
        }

        res.status(200).json({
            message: 'Policy deleted successfully',
            policyId,
            deletedDocuments: documentCount,
            deletedChunks,
        })
    } catch (err) {
        console.error('Failed to delete policy', err)
        res.status(500).json({
            error: 'Failed to delete policy',
            message: err instanceof Error ? err.message : 'Unknown error'
        })
    }
}