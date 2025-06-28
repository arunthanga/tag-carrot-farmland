import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^\+?[\d\s-()]+$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Base schemas
export const idSchema = z.string().uuid('Invalid ID format');
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(phoneRegex, 'Invalid phone number format');
export const slugSchema = z.string().regex(slugRegex, 'Invalid slug format');

// Coordinate schema
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

// Project schemas
export const projectTypeSchema = z.enum(['coconut', 'spice', 'backwater']);

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location too long'),
  pricePerSqFt: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  projectType: projectTypeSchema,
  coordinates: coordinatesSchema,
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  features: z.array(z.string()).min(1, 'At least one feature is required').max(10, 'Too many features'),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Too many images'),
  availableArea: z.number().positive('Available area must be positive'),
  minInvestment: z.number().positive('Minimum investment must be positive'),
  expectedReturns: z.string().max(50, 'Expected returns description too long'),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  type: projectTypeSchema.optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(50)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional(),
});

// Lead schemas
export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema,
  projectId: idSchema.optional(),
  message: z.string().max(500, 'Message too long').optional(),
  source: z.enum(['website', 'referral', 'social', 'advertisement']).default('website'),
  interests: z.array(projectTypeSchema).max(3, 'Too many interests selected'),
});

export const updateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']),
  notes: z.string().max(1000, 'Notes too long').optional(),
  followUpDate: z.string().datetime().optional(),
});

export const leadQuerySchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  source: z.enum(['website', 'referral', 'social', 'advertisement']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional(),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  phone: phoneSchema.optional(),
  currentPassword: z.string().min(8, 'Current password must be at least 8 characters').optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Current password is required when changing password',
    path: ['currentPassword'],
  }
);

// Blog schemas
export const createBlogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  slug: slugSchema,
  content: z.string().min(100, 'Content must be at least 100 characters'),
  excerpt: z.string().min(50, 'Excerpt must be at least 50 characters').max(300, 'Excerpt too long'),
  featuredImage: z.string().url('Invalid image URL').optional(),
  tags: z.array(z.string()).max(5, 'Too many tags'),
  published: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
});

export const updateBlogSchema = createBlogSchema.partial();

export const blogQuerySchema = z.object({
  published: z.string().transform(val => val === 'true').optional(),
  tag: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(20)).optional(),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional(),
});

// Testimonial schemas
export const createTestimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(500, 'Content too long'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  projectId: idSchema.optional(),
  featured: z.boolean().default(false),
  approved: z.boolean().default(false),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

// Type exports
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type CreateLead = z.infer<typeof createLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type LeadQuery = z.infer<typeof leadQuerySchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type CreateBlog = z.infer<typeof createBlogSchema>;
export type UpdateBlog = z.infer<typeof updateBlogSchema>;
export type BlogQuery = z.infer<typeof blogQuerySchema>;
export type CreateTestimonial = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonial = z.infer<typeof updateTestimonialSchema>;