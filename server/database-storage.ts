import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc, asc, like, gte, lte, inArray } from 'drizzle-orm';
import NodeCache from 'node-cache';
import { 
  projects, 
  leads, 
  users, 
  blogPosts, 
  testimonials,
  type Project,
  type Lead,
  type User,
  type BlogPost,
  type Testimonial
} from '../shared/schema';
import { 
  CreateProject,
  UpdateProject,
  ProjectQuery,
  CreateLead,
  UpdateLead,
  LeadQuery,
  CreateUser,
  UpdateUser,
  CreateBlog,
  UpdateBlog,
  BlogQuery,
  CreateTestimonial,
  UpdateTestimonial
} from '../shared/validation';
import { dbConfig, cacheConfig } from './config/env';
import { logInfo, logError, logWarn } from './config/logger';
import { hashPassword, comparePassword } from './middleware/auth';
import { NotFoundError, ConflictError } from './middleware/errorHandler';

// Database connection
const connectionString = dbConfig.url;
const client = postgres(connectionString, {
  ssl: dbConfig.ssl,
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);

// Cache instance
const cache = new NodeCache(cacheConfig);

export class DatabaseStorage {
  // Helper method to generate cache key
  private getCacheKey(prefix: string, params?: any): string {
    const key = params ? `${prefix}:${JSON.stringify(params)}` : prefix;
    return key;
  }

  // Helper method to invalidate related cache entries
  private invalidateCache(patterns: string[]): void {
    const keys = cache.keys();
    patterns.forEach(pattern => {
      const toDelete = keys.filter(key => key.includes(pattern));
      cache.del(toDelete);
    });
  }

  // PROJECT METHODS
  async getProjects(query?: ProjectQuery): Promise<Project[]> {
    const cacheKey = this.getCacheKey('projects', query);
    const cached = cache.get<Project[]>(cacheKey);
    
    if (cached) {
      logInfo('Projects cache hit', { query });
      return cached;
    }

    try {
      let dbQuery = db.select().from(projects).where(eq(projects.active, true));

      // Apply filters
      if (query?.type) {
        dbQuery = dbQuery.where(eq(projects.projectType, query.type));
      }
      if (query?.featured !== undefined) {
        dbQuery = dbQuery.where(eq(projects.featured, query.featured));
      }

      // Apply sorting
      dbQuery = dbQuery.orderBy(desc(projects.featured), asc(projects.name));

      // Apply pagination
      if (query?.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }
      if (query?.offset) {
        dbQuery = dbQuery.offset(query.offset);
      }

      const result = await dbQuery;
      cache.set(cacheKey, result);
      
      logInfo('Projects fetched from database', { count: result.length, query });
      return result;
    } catch (error) {
      logError('Failed to fetch projects', error as Error, { query });
      throw error;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const cacheKey = this.getCacheKey('project', { slug });
    const cached = cache.get<Project>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), eq(projects.active, true)))
        .limit(1);

      const project = result[0] || null;
      if (project) {
        cache.set(cacheKey, project);
      }

      return project;
    } catch (error) {
      logError('Failed to fetch project by slug', error as Error, { slug });
      throw error;
    }
  }

  async createProject(projectData: CreateProject): Promise<Project> {
    try {
      // Check if slug already exists
      const existing = await this.getProjectBySlug(projectData.slug);
      if (existing) {
        throw new ConflictError('Project with this slug already exists');
      }

      const result = await db
        .insert(projects)
        .values({
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const project = result[0];
      
      // Invalidate cache
      this.invalidateCache(['projects']);
      
      logInfo('Project created', { projectId: project.id, name: project.name });
      return project;
    } catch (error) {
      logError('Failed to create project', error as Error, { projectData });
      throw error;
    }
  }

  async updateProject(id: string, updates: UpdateProject): Promise<Project> {
    try {
      const result = await db
        .update(projects)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      if (result.length === 0) {
        throw new NotFoundError('Project not found');
      }

      const project = result[0];
      
      // Invalidate cache
      this.invalidateCache(['projects', 'project']);
      
      logInfo('Project updated', { projectId: id, updates });
      return project;
    } catch (error) {
      logError('Failed to update project', error as Error, { id, updates });
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      // Soft delete
      const result = await db
        .update(projects)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(projects.id, id))
        .returning();

      if (result.length === 0) {
        throw new NotFoundError('Project not found');
      }

      // Invalidate cache
      this.invalidateCache(['projects', 'project']);
      
      logInfo('Project deleted', { projectId: id });
    } catch (error) {
      logError('Failed to delete project', error as Error, { id });
      throw error;
    }
  }

  // LEAD METHODS
  async getLeads(query?: LeadQuery): Promise<Lead[]> {
    const cacheKey = this.getCacheKey('leads', query);
    const cached = cache.get<Lead[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let dbQuery = db.select().from(leads);

      // Apply filters
      const conditions = [];
      if (query?.status) {
        conditions.push(eq(leads.status, query.status));
      }
      if (query?.source) {
        conditions.push(eq(leads.source, query.source));
      }
      if (query?.dateFrom) {
        conditions.push(gte(leads.createdAt, new Date(query.dateFrom)));
      }
      if (query?.dateTo) {
        conditions.push(lte(leads.createdAt, new Date(query.dateTo)));
      }

      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }

      // Apply sorting
      dbQuery = dbQuery.orderBy(desc(leads.createdAt));

      // Apply pagination
      if (query?.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }
      if (query?.offset) {
        dbQuery = dbQuery.offset(query.offset);
      }

      const result = await dbQuery;
      cache.set(cacheKey, result);
      
      logInfo('Leads fetched from database', { count: result.length, query });
      return result;
    } catch (error) {
      logError('Failed to fetch leads', error as Error, { query });
      throw error;
    }
  }

  async createLead(leadData: CreateLead): Promise<Lead> {
    try {
      const result = await db
        .insert(leads)
        .values({
          ...leadData,
          id: crypto.randomUUID(),
          status: 'new',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const lead = result[0];
      
      // Invalidate cache
      this.invalidateCache(['leads']);
      
      logInfo('Lead created', { leadId: lead.id, email: lead.email });
      return lead;
    } catch (error) {
      logError('Failed to create lead', error as Error, { leadData });
      throw error;
    }
  }

  async updateLead(id: string, updates: UpdateLead): Promise<Lead> {
    try {
      const result = await db
        .update(leads)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, id))
        .returning();

      if (result.length === 0) {
        throw new NotFoundError('Lead not found');
      }

      const lead = result[0];
      
      // Invalidate cache
      this.invalidateCache(['leads']);
      
      logInfo('Lead updated', { leadId: id, updates });
      return lead;
    } catch (error) {
      logError('Failed to update lead', error as Error, { id, updates });
      throw error;
    }
  }

  // USER METHODS
  async getUserByEmail(email: string): Promise<User | null> {
    const cacheKey = this.getCacheKey('user', { email });
    const cached = cache.get<User>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = result[0] || null;
      if (user) {
        cache.set(cacheKey, user);
      }

      return user;
    } catch (error) {
      logError('Failed to fetch user by email', error as Error, { email });
      throw error;
    }
  }

  async createUser(userData: CreateUser): Promise<User> {
    try {
      // Check if user already exists
      const existing = await this.getUserByEmail(userData.email);
      if (existing) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      const result = await db
        .insert(users)
        .values({
          ...userData,
          id: crypto.randomUUID(),
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const user = result[0];
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Invalidate cache
      this.invalidateCache(['user']);
      
      logInfo('User created', { userId: user.id, email: user.email });
      return userWithoutPassword as User;
    } catch (error) {
      logError('Failed to create user', error as Error, { email: userData.email });
      throw error;
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        logWarn('Authentication attempt for non-existent user', { email });
        return null;
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        logWarn('Invalid password attempt', { email, userId: user.id });
        return null;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      logInfo('User authenticated successfully', { userId: user.id, email });
      return userWithoutPassword as User;
    } catch (error) {
      logError('Failed to authenticate user', error as Error, { email });
      throw error;
    }
  }

  // BLOG METHODS
  async getBlogPosts(query?: BlogQuery): Promise<BlogPost[]> {
    const cacheKey = this.getCacheKey('blog', query);
    const cached = cache.get<BlogPost[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let dbQuery = db.select().from(blogPosts);

      // Apply filters
      const conditions = [];
      if (query?.published !== undefined) {
        conditions.push(eq(blogPosts.published, query.published));
      }
      if (query?.tag) {
        conditions.push(like(blogPosts.tags, `%${query.tag}%`));
      }

      if (conditions.length > 0) {
        dbQuery = dbQuery.where(and(...conditions));
      }

      // Apply sorting
      dbQuery = dbQuery.orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));

      // Apply pagination
      if (query?.limit) {
        dbQuery = dbQuery.limit(query.limit);
      }
      if (query?.offset) {
        dbQuery = dbQuery.offset(query.offset);
      }

      const result = await dbQuery;
      cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      logError('Failed to fetch blog posts', error as Error, { query });
      throw error;
    }
  }

  // TESTIMONIAL METHODS
  async getTestimonials(featured?: boolean): Promise<Testimonial[]> {
    const cacheKey = this.getCacheKey('testimonials', { featured });
    const cached = cache.get<Testimonial[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let dbQuery = db.select().from(testimonials).where(eq(testimonials.approved, true));

      if (featured !== undefined) {
        dbQuery = dbQuery.where(and(eq(testimonials.approved, true), eq(testimonials.featured, featured)));
      }

      dbQuery = dbQuery.orderBy(desc(testimonials.featured), desc(testimonials.createdAt));

      const result = await dbQuery;
      cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      logError('Failed to fetch testimonials', error as Error, { featured });
      throw error;
    }
  }

  // HEALTH CHECK
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await db.select().from(projects).limit(1);
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      logError('Database health check failed', error as Error);
      throw error;
    }
  }

  // CLEANUP
  async close(): Promise<void> {
    await client.end();
    cache.flushAll();
    logInfo('Database connection closed');
  }
}