import { Router } from 'express'
import { authenticateToken } from '../middleware/authMiddleware'
import { getAnswer } from '../controllers/qaController'

const router = Router()

router.post('/ask', authenticateToken, getAnswer)

export default router