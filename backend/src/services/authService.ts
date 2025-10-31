import { db } from '../db/db'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'

export const register = async (email: string, password: string) => {
//    check if user exists
        const query = `SELECT * FROM users WHERE email = $1`
        const result = await db.query(query,[email])

        if(result.rows.length > 0){
            throw new Error('User already exists')
        }
    
        const passwordHash = await bcrypt.hash(password, 10)

        const insertQuery = `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at`;
        const insertResult = await db.query(insertQuery, [email, passwordHash]);

        return insertResult.rows[0]
       
}

export const login = async (email: string, password: string) => {
    const query = `SELECT * FROM users WHERE email = $1`
    const result = await db.query(query, [email])
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret){
        throw new Error('JWT_SECRET is not defined in env variables')
    }

    if(result.rows.length === 0){
        throw new Error('Invalid email or password')
    }

    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if(!isValidPassword){
        throw new Error('Invalid email or password')
    }

    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    };
    
    const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        options
    )
    
    return {
        user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
        },
        token
    };

}