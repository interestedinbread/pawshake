import { Request, Response } from 'express'
import { register, login } from '../services/authService'

export const registerUser = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
    }

    try{
        const user = await register(email, password)
        res.status(201).json({ user })
    } catch (err) {
        if (err instanceof Error && err.message === 'User already exists') {
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }

}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body
    if(!email || !password){
        return res.status(400).json({ error: 'Email and password required'})
    }

    try{
        const result = await login(email, password)
        return res.status(200).json({ user: result.user, token: result.token })

    } catch (err) {
        if (err instanceof Error && err.message === 'Invalid email or password') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}