import express from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { DatabaseStorage } from './database-storage';
import { logger } from './utils/logger';
import { asyncHandler } from './utils/asyncHandler';
import { validateRequest } from './middleware/validation';
import { authenticateToken } from './middleware/auth';

const router = express.Router();
const storage = new DatabaseStorage();

// Security middleware
router.use(helmet());
router.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // More restrictive for sensitive endpoints
  message: 'Rate limit exceeded for this endpoint',
});

router.use('/api', limiter);

// Validation schemas
const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  location: z.string().min(2).max(100),
  projectInterest: z.string().optional(),
  message: z.string().max(1000, 'Message too long').optional(),
  source: z.enum(['website', 'social', 'referral', 'other']).default('website'),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional()
});

const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  location: z.string().min(2).max(100)
});

const projectQuerySchema = z.object({
  location: z.string().optional(),
  type: z.enum(['coconut', 'spice', 'backwater']).optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10')
});

// Projects endpoints
router.get('/api/projects', 
  validateRequest({ query: projectQuerySchema }),
  asyncHandler(async (req, res) => {
    const { location, type, minPrice, maxPrice, page, limit } = req.query;
    
    const filters = {
      location,
      type,
      priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : undefined
    };
    
    const result = await storage.getProjects(filters, { page, limit });
    
    res.json({
      success: true,
      data: result.projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        itemsPerPage: limit
      }
    });
  })
);

router.get('/api/projects/featured', 
  asyncHandler(async (req, res) => {
    const projects = await storage.getFeaturedProjects();
    res.json({
      success: true,
      data: projects
    });
  })
);

router.get('/api/projects/:slug', 
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const project = await storage.getProjectBySlug(slug);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Track project views for analytics
    await storage.incrementProjectViews(project.id);
    
    res.json({
      success: true,
      data: project
    });
  })
);

// Lead management endpoints
router.post('/api/leads', 
  strictLimiter,
  validateRequest({ body: leadSchema }),
  asyncHandler(async (req, res) => {
    const leadData = req.body;
    
    // Check for duplicate leads (same email within 24 hours)
    const existingLead = await storage.getRecentLeadByEmail(leadData.email);
    if (existingLead) {
      return res.status(409).json({
        success: false,
        error: 'A lead with this email was already submitted recently'
      });
    }
    
    const lead = await storage.createLead({
      ...leadData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      createdAt: new Date()
    });
    
    // Send notification email (implement this based on your email service)
    // await emailService.sendLeadNotification(lead);
    
    logger.info('New lead created', { leadId: lead.id, email: lead.email });
    
    res.status(201).json({
      success: true,
      data: { id: lead.id },
      message: 'Thank you for your interest! We will contact you soon.'
    });
  })
);

router.get('/api/leads', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, source } = req.query;
    
    const filters = { status, source };
    const leads = await storage.getLeads(filters, { page: Number(page), limit: Number(limit) });
    
    res.json({
      success: true,
      data: leads
    });
  })
);

// User management endpoints
router.post('/api/users', 
  strictLimiter,
  validateRequest({ body: userSchema }),
  asyncHandler(async (req, res) => {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    const user = await storage.createUser(userData);
    
    // Remove password from response
    const { password, ...userResponse } = user;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  })
);

// Blog endpoints
router.get('/api/blog', 
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, featured } = req.query;
    
    const filters = { category, featured: featured === 'true' };
    const posts = await storage.getBlogPosts(filters, { page: Number(page), limit: Number(limit) });
    
    res.json({
      success: true,
      data: posts
    });
  })
);

router.get('/api/blog/:slug', 
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const post = await storage.getBlogPostBySlug(slug);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  })
);

// Testimonials endpoint
router.get('/api/testimonials', 
  asyncHandler(async (req, res) => {
    const { featured } = req.query;
    const testimonials = await storage.getTestimonials({ featured: featured === 'true' });
    
    res.json({
      success: true,
      data: testimonials
    });
  })
);

// Analytics endpoint
router.get('/api/analytics/dashboard', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { dateRange = '30d' } = req.query;
    
    const analytics = await storage.getAnalyticsDashboard(dateRange);
    
    res.json({
      success: true,
      data: analytics
    });
  })
);

// Health check endpoint
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Global error handler
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('API Error', { error: err.message, stack: err.stack, path: req.path });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

export default router;