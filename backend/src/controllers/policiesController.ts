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