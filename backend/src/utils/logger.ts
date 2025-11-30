import winston from 'winston';
import { env } from '../config/env';

/**
 * Logger utility with structured logging
 * 
 * - Development: Human-readable colored logs
 * - Production: JSON structured logs for log aggregation services
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Development format: Human-readable with colors
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Production format: JSON structured logs
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: isDevelopment ? developmentFormat : productionFormat,
  defaultMeta: {
    service: 'pet-insurance-assistant',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: isDevelopment ? developmentFormat : productionFormat,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// In production, also write errors to a file (optional)
if (!isDevelopment) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Logger instance with methods:
 * - logger.info(message, meta?)
 * - logger.warn(message, meta?)
 * - logger.error(message, meta?)
 * - logger.debug(message, meta?)
 */
export default logger;

