import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { env } from './config/env'
import { testDatabaseConnection } from './db/db'
import { initializeSchema } from './db/schema'
import logger from './utils/logger'
import authRoutes from './routes/authRoutes'
import documentRoutes from './routes/documentRoutes'
import policyRoutes from './routes/policyRoutes'
import qaRoutes from './routes/qaRoutes'

const app = express()
const ALLOWED_ORIGIN = env.corsOrigin

app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

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

// Global error handler with structured logging
app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Extract error information
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  const errorStack = err instanceof Error ? err.stack : undefined;
  
  // Build request context for logging
  const requestContext = {
    method: req.method,
    path: req.path,
    url: req.url,
    userId: req.userId,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    // Only include body for non-sensitive endpoints (exclude auth)
    ...(req.path?.startsWith('/api/auth') ? {} : { 
      body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined 
    }),
  };

  // Log the error with full context
  logger.error('Unhandled error in request', {
    error: errorMessage,
    stack: errorStack,
    ...requestContext,
  });

  // Send generic error response (don't leak internal details)
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database connection and schema before starting server
(async () => {
  try {
    // Test database connection first
    console.log('Testing database connection...');
    await testDatabaseConnection();
    console.log('Database connection successful');

    // Initialize database schema
    console.log('Initializing database schema...');
    await initializeSchema();
    console.log('Database schema initialized');

    // Start the server
    app.listen(env.port, () => console.log(`Server is running on port ${env.port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();