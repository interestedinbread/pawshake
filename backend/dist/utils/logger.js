"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
/**
 * Logger utility with structured logging
 *
 * - Development: Human-readable colored logs
 * - Production: JSON structured logs for log aggregation services
 */
const isDevelopment = process.env.NODE_ENV !== 'production';
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Development format: Human-readable with colors
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
}));
// Production format: JSON structured logs
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Create the logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    format: isDevelopment ? developmentFormat : productionFormat,
    defaultMeta: {
        service: 'pet-insurance-assistant',
        environment: process.env.NODE_ENV || 'development',
    },
    transports: [
        // Write all logs to console
        new winston_1.default.transports.Console({
            format: isDevelopment ? developmentFormat : productionFormat,
        }),
    ],
    // Don't exit on handled exceptions
    exitOnError: false,
});
// In production, also write errors to a file (optional)
if (!isDevelopment) {
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
    logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: productionFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }));
}
/**
 * Logger instance with methods:
 * - logger.info(message, meta?)
 * - logger.warn(message, meta?)
 * - logger.error(message, meta?)
 * - logger.debug(message, meta?)
 */
exports.default = logger;
//# sourceMappingURL=logger.js.map