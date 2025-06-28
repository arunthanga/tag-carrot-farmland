import express from 'express';
import rateLimit from 'express-rate-limit';
import { DatabaseStorage } from './database-storage';
import { 
  authenticate, 
  requireAdmin, 
  optionalAuthenticate,
  generateToken,
  rateLimitByUser
} from './middleware/auth';
import { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler, 
  validateRequest,
  NotFoundError,
  ValidationError,
  AuthenticationError
} from './middleware/errorHandler';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  createUserSchema,
  loginSchema,
  updateUserSchema,
  blogQuerySchema,
  idSchema
} from '../shared/validation';
import { rateLimitConfig } from './config/env';
import { logInfo, logWarn } from './config/logger';

const router = express.Router();
export const storage = new DatabaseStorage();

// Rate limiting
const generalLimiter = rateLimit({
  ...rateLimitConfig,
  message: { error: 'Too many requests, please try again later.' }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Too many requests for this action, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: { error: 'Too many login attempts, please try again later.' }
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

// HEALTH CHECK
router.get('/health', asyncHandler(async (req, res) => {
  const health = await storage.healthCheck();
  res.json(health);
}));

// PUBLIC ROUTES

// Get all projects (public)
router.get('/projects', 
  validateRequest({ query: projectQuerySchema }),
  asyncHandler(async (req, res) => {
    const projects = await storage.getProjects(req.query);
    res.json({
      data: projects,
      meta: {
        count: projects.length,
        query: req.query
      }
    });
  })
);

// Get featured projects (public)
router.get('/projects/featured', 
  asyncHandler(async (req, res) => {
    const projects = await storage.getProjects({ featured: true, limit: 6 });
    res.json({
      data: projects,
      meta: {
        count: projects.length
      }
    });
  })
);

// Get project by slug (public)
router.get('/projects/:slug', 
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const project = await storage.getProjectBySlug(slug);
    
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    
    res.json({ data: project });
  })
);

// Create lead (public, with strict rate limiting)
router.post('/leads',
  strictLimiter,
  validateRequest({ body: createLeadSchema }),
  asyncHandler(async (req, res) => {
    const lead = await storage.createLead(req.body);
    
    logInfo('New lead created', { 
      leadId: lead.id, 
      email: lead.email,
      source: lead.source,
      ip: req.ip 
    });
    
    res.status(201).json({
      data: lead,
      message: 'Thank you for your interest! We will contact you soon.'
    });
  })
);

// Get blog posts (public)
router.get('/blog',
  validateRequest({ query: blogQuerySchema }),
  asyncHandler(async (req, res) => {
    const posts = await storage.getBlogPosts({ ...req.query, published: true });
    res.json({
      data: posts,
      meta: {
        count: posts.length
      }
    });
  })
);

// Get testimonials (public)
router.get('/testimonials',
  asyncHandler(async (req, res) => {
    const featured = req.query.featured === 'true';
    const testimonials = await storage.getTestimonials(featured);
    res.json({
      data: testimonials,
      meta: {
        count: testimonials.length
      }
    });
  })
);

// AUTHENTICATION ROUTES

// User registration
router.post('/auth/register',
  strictLimiter,
  validateRequest({ body: createUserSchema }),
  asyncHandler(async (req, res) => {
    const user = await storage.createUser(req.body);
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    logInfo('User registered', { userId: user.id, email: user.email });
    
    res.status(201).json({
      data: { user, token },
      message: 'Account created successfully'
    });
  })
);

// User login
router.post('/auth/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.authenticateUser(email, password);
    
    if (!user) {
      logWarn('Failed login attempt', { email, ip: req.ip });
      throw new AuthenticationError('Invalid email or password');
    }
    
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    logInfo('User logged in', { userId: user.id, email: user.email });
    
    res.json({
      data: { user, token },
      message: 'Login successful'
    });
  })
);

// Get current user profile
router.get('/auth/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await storage.getUserByEmail(req.user!.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ data: userWithoutPassword });
  })
);

// Update user profile
router.put('/auth/me',
  authenticate,
  rateLimitByUser(10, 15 * 60 * 1000), // 10 requests per 15 minutes per user
  validateRequest({ body: updateUserSchema }),
  asyncHandler(async (req, res) => {
    // Implementation would go here - updating user profile
    res.json({ message: 'Profile update endpoint - to be implemented' });
  })
);

// PROTECTED ROUTES (Admin only)

// Get all leads (admin only)
router.get('/admin/leads',
  authenticate,
  requireAdmin,
  validateRequest({ query: leadQuerySchema }),
  asyncHandler(async (req, res) => {
    const leads = await storage.getLeads(req.query);
    res.json({
      data: leads,
      meta: {
        count: leads.length,
        query: req.query
      }
    });
  })
);

// Update lead status (admin only)
router.put('/admin/leads/:id',
  authenticate,
  requireAdmin,
  validateRequest({ 
    params: idSchema.transform(id => ({ id })),
    body: updateLeadSchema 
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const lead = await storage.updateLead(id, req.body);
    
    logInfo('Lead updated by admin', { 
      leadId: id, 
      adminId: req.user!.id,
      updates: req.body 
    });
    
    res.json({
      data: lead,
      message: 'Lead updated successfully'
    });
  })
);

// Create project (admin only)
router.post('/admin/projects',
  authenticate,
  requireAdmin,
  validateRequest({ body: createProjectSchema }),
  asyncHandler(async (req, res) => {
    const project = await storage.createProject(req.body);
    
    logInfo('Project created by admin', { 
      projectId: project.id, 
      adminId: req.user!.id 
    });
    
    res.status(201).json({
      data: project,
      message: 'Project created successfully'
    });
  })
);

// Update project (admin only)
router.put('/admin/projects/:id',
  authenticate,
  requireAdmin,
  validateRequest({ 
    params: idSchema.transform(id => ({ id })),
    body: updateProjectSchema 
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await storage.updateProject(id, req.body);
    
    logInfo('Project updated by admin', { 
      projectId: id, 
      adminId: req.user!.id,
      updates: req.body 
    });
    
    res.json({
      data: project,
      message: 'Project updated successfully'
    });
  })
);

// Delete project (admin only)
router.delete('/admin/projects/:id',
  authenticate,
  requireAdmin,
  validateRequest({ params: idSchema.transform(id => ({ id })) }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    await storage.deleteProject(id);
    
    logInfo('Project deleted by admin', { 
      projectId: id, 
      adminId: req.user!.id 
    });
    
    res.json({ message: 'Project deleted successfully' });
  })
);

// Get all blog posts (admin only)
router.get('/admin/blog',
  authenticate,
  requireAdmin,
  validateRequest({ query: blogQuerySchema }),
  asyncHandler(async (req, res) => {
    const posts = await storage.getBlogPosts(req.query);
    res.json({
      data: posts,
      meta: {
        count: posts.length
      }
    });
  })
);

// Analytics endpoint (admin only)
router.get('/admin/analytics',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    // Get basic analytics
    const [allLeads, newLeads, allProjects] = await Promise.all([
      storage.getLeads(),
      storage.getLeads({ status: 'new' }),
      storage.getProjects()
    ]);

    const analytics = {
      leads: {
        total: allLeads.length,
        new: newLeads.length,
        byStatus: allLeads.reduce((acc, lead) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {} as Record