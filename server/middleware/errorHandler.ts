import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '../config/logger';
import { isProduction } from '../config/env';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// Error response interface
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  stack?: string;
}

// Handle Zod validation errors
const handleZodError = (error: ZodError): ErrorResponse => {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details,
  };
};

// Handle database errors
const handleDatabaseError = (error: any): ErrorResponse => {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      return {
        error: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
      };
    case '23503': // Foreign key violation
      return {
        error: 'Referenced resource does not exist',
        code: 'FOREIGN_KEY_VIOLATION',
      };
    case '23502': // Not null violation
      return {
        error: 'Required field is missing',
        code: 'REQUIRED_FIELD_MISSING',
      };
    case '22001': // String data too long
      return {
        error: 'Data too long for field',
        code: 'DATA_TOO_LONG',
      };
    case '08006': // Connection failure
      return {
        error: 'Database connection failed',
        code: 'DATABASE_CONNECTION_ERROR',
      };
    default:
      return {
        error: 'Database operation failed',
        code: 'DATABASE_ERROR',
      };
  }
};

// Handle JWT errors
const handleJWTError = (error: any): ErrorResponse => {
  switch (error.name) {
    case 'JsonWebTokenError':
      return {
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      };
    case 'TokenExpiredError':
      return {
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      };
    case 'NotBeforeError':
      return {
        error: 'Token not active yet',
        code: 'TOKEN_NOT_ACTIVE',
      };
    default:
      return {
        error: 'Token verification failed',
        code: 'TOKEN_ERROR',
      };
  }
};