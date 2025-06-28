import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtConfig } from '../config/env';
import { logError, logWarn } from '../config/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'admin';
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: 'tag-carrot',
    audience: 'tag-carrot-users',
  });
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: 'tag-carrot',
      audience: 'tag-carrot-users',
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    logError('Token verification failed', error as Error);
    return null;
  }
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization token required',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logError('Authentication middleware error', error as Error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'AUTH_INTERNAL_ERROR',
    });
  }
};

// Admin authorization middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  if (req.user.role !== 'admin') {
    logWarn('Unauthorized admin access attempt', { 
      userId: req.user.id, 
      email: req.user.email,
      ip: req.ip,
      endpoint: req.path 
    });
    
    return res.status(403).json({
      error: 'Admin access required',
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    logError('Optional authentication middleware error', error as Error);
    next(); // Continue without authentication
  }
};

// Rate limiting by user
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated users
    }

    const userId = req.user.id;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      logWarn('User rate limit exceeded', { 
        userId, 
        count: userLimit.count, 
        endpoint: req.path 
      });
      
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count += 1;
    next();
  };
};

// Session validation middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next();
  }

  try {
    // Here you could add additional session validation logic
    // For example, checking if user still exists in database
    // or if their permissions have changed
    
    // For now, we'll just validate that the token hasn't been tampered with
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (!decoded || decoded.id !== req.user.id) {
        return res.status(401).json({
          error: 'Session invalid',
          code: 'SESSION_INVALID',
        });
      }
    }
    
    next();
  } catch (error) {
    logError('Session validation error', error as Error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SESSION_VALIDATION_ERROR',
    });
  }
};