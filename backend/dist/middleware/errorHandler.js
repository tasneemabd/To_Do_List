"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../utils/logger"));
class AppError extends Error {
    constructor(message, statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
    if (err instanceof AppError) {
        logger_1.default.error(`App Error: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        const zodError = err;
        logger_1.default.error('Validation error:', zodError.errors);
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation error',
            errors: zodError.errors,
        });
        return;
    }
    // Handle Mongoose errors
    if (err.name === 'MongoServerError' || err.name === 'MongoError') {
        const mongoError = err;
        logger_1.default.error('Database error:', mongoError);
        if (mongoError.code === 11000) {
            // Duplicate key error
            const field = Object.keys(mongoError.keyPattern || {})[0];
            res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                success: false,
                message: `${field} already exists. Please use a different ${field}.`,
            });
            return;
        }
    }
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const validationError = err;
        logger_1.default.error('Validation error:', validationError.errors);
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(validationError.errors).map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
        return;
    }
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        logger_1.default.error('Cast error:', err);
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid ID format',
        });
        return;
    }
    // Default error handler
    logger_1.default.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map