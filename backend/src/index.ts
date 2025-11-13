import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { initializeSchema } from './db/schema'
import authRoutes from './routes/authRoutes'
import documentRoutes from './routes/documentRoutes'
import policyRoutes from './routes/policyRoutes'
import qaRoutes from './routes/qaRoutes'

const app = express()
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || '*'

app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

app.get('/health', (_, res) => {
    res.json({
        status: 'ok'
    })
})

app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/policies', policyRoutes)
app.use('/api/qa', qaRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

const PORT = process.env.PORT || 3000;

// Initialize database schema before starting server
(async () => {
  try {
    await initializeSchema();
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    process.exit(1);
  }
})();