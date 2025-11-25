import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(`App Error: ${err.message}`, {
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
    const zodError = err as any;
    logger.error('Validation error:', zodError.errors);

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors: zodError.errors,
    });
    return;
  }

  // Handle Mongoose errors
  if (err.name === 'MongoServerError' || err.name === 'MongoError') {
    const mongoError = err as any;
    logger.error('Database error:', mongoError);

    if (mongoError.code === 11000) {
      // Duplicate key error
      const field = Object.keys(mongoError.keyPattern || {})[0];
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `${field} already exists. Please use a different ${field}.`,
      });
      return;
    }
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const validationError = err as any;
    logger.error('Validation error:', validationError.errors);

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(validationError.errors).map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    logger.error('Cast error:', err);

    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // Default error handler
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

