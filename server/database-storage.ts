import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, gte, lte, desc, sql, ilike } from 'drizzle-orm';
import { projects, leads, users, blogPosts, testimonials, projectViews, analytics } from '../shared/schema';
import { Redis } from 'ioredis';
import { logger } from './utils/logger';
import { Pool, PoolClient } from 'pg';

interface DatabaseConfig {
  connectionString: string;
  maxConnections?: number;
  idleTimeout?: number;
  ssl?: boolean;
}

interface CacheConfig {
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  ttl?: number;
}

export class DatabaseStorage {
  private readonly redis: Redis;
  private readonly pool: Pool;
  private db: ReturnType<typeof drizzle>;
  private readonly cacheTTL: number;

  constructor(config?: { database?: DatabaseConfig; cache?: CacheConfig }) {
    // Initialize connection pool
    this.pool = new Pool({
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize Redis for caching
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    const connectionString = config?.database?.connectionString || process.env.DATABASE_URL!;
    const client = postgres(connectionString, {
      max: config?.database?.maxConnections || 20,
      idle_timeout: config?.database?.idleTimeout || 20,
      ssl: config?.database?.ssl || process.env.NODE_ENV === 'production'
    });

    this.db = drizzle(client);
    this.cacheTTL = config?.cache?.ttl || 300;

    this.setupHealthCheck();
    this.initializeDatabase();
  }
  
  private setupHealthCheck() {
    setInterval(async () => {
      try {
        await this.pool.query('SELECT 1');
        await this.redis.ping();
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    }, 30000);
  }

  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async initializeDatabase() {
    try {
      // Create indexes for better performance
      await this.createIndexes();
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Database initialization failed', error);
      throw error;
    }
  }

  private async createIndexes() {
    // Create indexes for commonly queried fields
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_location ON projects(location)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_type ON projects(project_type)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_featured ON projects(featured)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_price ON projects(price_per_sq_ft)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email ON leads(email)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_at ON leads(created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status ON leads(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_views_project_id ON project_views(project_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_views_created_at ON project_views(created_at)'
    ];

    for (const indexSQL of indexes) {
      try {
        await this.db.execute(sql.raw(indexSQL));
      } catch (error) {
        // Index might already exist, continue
        logger.debug('Index creation skipped', { sql: indexSQL });
      }
    }
  }

  private getCacheKey(prefix: string, ...params: (string | number)[]): string {
    return `tagcarrot:${prefix}:${params.join(':')}`;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.cache) return null;
    
    try {
      const cached = await this.cache.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.warn('Cache get error', { key, error });
      return null;
    }
  }

  private async setCache(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.cache) return;
    
    try {
      await this.cache.setex(key, ttl || this.cacheTTL, JSON.stringify(value));
    } catch (error) {
      logger.warn('Cache set error', { key, error });
    }
  }

  private async invalidateCache(pattern: string): Promise<void> {
    if (!this.cache) return;
    
    try {
      const keys = await this.cache.keys(pattern);
      if (keys.length > 0) {
        await this.cache.del(...keys);
      }
    } catch (error) {
      logger.warn('Cache invalidation error', { pattern, error });
    }
  }

  // Projects methods
  async getProjects(filters: any = {}, pagination: { page: number; limit: number } = { page: 1, limit: 10 }) {
    const cacheKey = this.getCacheKey('projects', JSON.stringify(filters), pagination.page, pagination.limit);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let query = this.db.select().from(projects);
      let countQuery = this.db.select({ count: sql<number>`count(*)` }).from(projects);

      // Apply filters
      const conditions = [];
      if (filters.location) {
        conditions.push(ilike(projects.location, `%${filters.location}%`));
      }
      if (filters.type) {
        conditions.push(eq(projects.projectType, filters.type));
      }
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          conditions.push(gte(projects.pricePerSqFt, filters.priceRange.min));
        }
        if (filters.priceRange.max) {
          conditions.push(lte(projects.pricePerSqFt, filters.priceRange.max));
        }
      }

      if (conditions.length > 0) {
        const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
        query = query.where(whereClause);
        countQuery = countQuery.where(whereClause);
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.limit(pagination.limit).offset(offset).orderBy(desc(projects.createdAt));

      const [projectsResult, countResult] = await Promise.all([
        query,
        countQuery
      ]);

      const result = {
        projects: projectsResult,
        total: countResult[0].count
      };

      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error fetching projects', error);
      throw error;
    }
  }

  async getFeaturedProjects() {
    const cacheKey = this.getCacheKey('projects', 'featured');
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const featuredProjects = await this.db
        .select()
        .from(projects)
        .where(eq(projects.featured, true))
        .orderBy(desc(projects.createdAt))
        .limit(6);

      await this.setCache(cacheKey, featuredProjects);
      return featuredProjects;
    } catch (error) {
      logger.error('Error fetching featured projects', error);
      throw error;
    }
  }

  async getProjectBySlug(slug: string) {
    const cacheKey = this.getCacheKey('project', 'slug', slug);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const project = await this.db
        .select()
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);

      const result = project[0] || null;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error fetching project by slug', error);
      throw error;
    }
  }

  async incrementProjectViews(projectId: string) {
    try {
      await this.db.insert(projectViews).values({
        id: crypto.randomUUID(),
        projectId,
        viewedAt: new Date(),
        ipAddress: '', // Will be set by the calling function
        userAgent: ''
      });

      // Invalidate project cache
      await this.invalidateCache(`tagcarrot:project:*`);
    } catch (error) {
      logger.error('Error incrementing project views', error);
    }
  }

  // Leads methods
  async createLead(leadData: any) {
    try {
      const lead = await this.db.insert(leads).values({
        id: crypto.randomUUID(),
        ...leadData,
        status: 'new',
        createdAt: new Date()
      }).returning();

      // Invalidate leads cache
      await this.invalidateCache('tagcarrot:leads:*');

      // Update analytics
      await this.updateAnalytics('lead_created');

      return lead[0];
    } catch (error) {
      logger.error('Error creating lead', error);
      throw error;
    }
  }

  async getRecentLeadByEmail(email: string, hours: number = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    try {
      const recentLead = await this.db
        .select()
        .from(leads)
        .where(and(
          eq(leads.email, email),
          gte(leads.createdAt, cutoff)
        ))
        .limit(1);

      return recentLead[0] || null;
    } catch (error) {
      logger.error('Error checking recent lead', error);
      throw error;
    }
  }

  async getLeads(filters: any = {}, pagination: { page: number; limit: number } = { page: 1, limit: 20 }) {
    try {
      let query = this.db.select().from(leads);

      const conditions = [];
      if (filters.status) {
        conditions.push(eq(leads.status, filters.status));
      }
      if (filters.source) {
        conditions.push(eq(leads.source, filters.source));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const offset = (pagination.page - 1) * pagination.limit;
      const result = await query
        .limit(pagination.limit)
        .offset(offset)
        .orderBy(desc(leads.createdAt));

      return result;
    } catch (error) {
      logger.error('Error fetching leads', error);
      throw error;
    }
  }

  // Users methods
  async createUser(userData: any) {
    try {
      const hashedPassword = await this.hashPassword(userData.password);
      
      const user = await this.db.insert(users).values({
        id: crypto.randomUUID(),
        ...userData,
        password: hashedPassword,
        createdAt: new Date()
      }).returning();

      await this.updateAnalytics('user_registered');

      return user[0];
    } catch (error) {
      logger.error('Error creating user', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user[0] || null;
    } catch (error) {
      logger.error('Error fetching user by email', error);
      throw error;
    }
  }

  // Blog methods
  async getBlogPosts(filters: any = {}, pagination: { page: number; limit: number } = { page: 1, limit: 10 }) {
    const cacheKey = this.getCacheKey('blog', JSON.stringify(filters), pagination.page, pagination.limit);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let query = this.db.select().from(blogPosts);

      const conditions = [eq(blogPosts.published, true)];
      if (filters.category) {
        conditions.push(eq(blogPosts.category, filters.category));
      }
      if (filters.featured) {
        conditions.push(eq(blogPosts.featured, filters.featured));
      }

      query = query.where(and(...conditions));

      const offset = (pagination.page - 1) * pagination.limit;
      const result = await query
        .limit(pagination.limit)
        .offset(offset)
        .orderBy(desc(blogPosts.publishedAt));

      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error fetching blog posts', error);
      throw error;
    }
  }

  async getBlogPostBySlug(slug: string) {
    const cacheKey = this.getCacheKey('blog', 'slug', slug);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const post = await this.db
        .select()
        .from(blogPosts)
        .where(and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.published, true)
        ))
        .limit(1);

      const result = post[0] || null;
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error fetching blog post by slug', error);
      throw error;
    }
  }

  // Testimonials methods
  async getTestimonials(filters: any = {}) {
    const cacheKey = this.getCacheKey('testimonials', JSON.stringify(filters));
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let query = this.db.select().from(testimonials);

      if (filters.featured) {
        query = query.where(eq(testimonials.featured, filters.featured));
      }

      const result = await query.orderBy(desc(testimonials.createdAt));
      await this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error fetching testimonials', error);
      throw error;
    }
  }

  // Analytics methods
  async updateAnalytics(event: string, metadata?: any) {
    try {
      await this.db.insert(analytics).values({
        id: crypto.randomUUID(),
        event,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Error updating analytics', error);
    }
  }

  async getAnalyticsDashboard(dateRange: string = '30d') {
    const cacheKey = this.getCacheKey('analytics', 'dashboard', dateRange);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const days = parseInt(dateRange.replace('d', ''));
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [leadStats, userStats, projectViews, topProjects] = await Promise.all([
        this.getLeadStats(cutoff),
        this.getUserStats(cutoff),
        this.getProjectViewStats(cutoff),
        this.getTopProjects(cutoff)
      ]);

      const result = {
        leadStats,
        userStats,
        projectViews,
        topProjects,
        generatedAt: new Date()
      };

      await this.setCache(cacheKey, result, 600); // Cache for 10 minutes
      return result;
    } catch (error) {
      logger.error('Error generating analytics dashboard', error);
      throw error;
    }
  }

  private async getLeadStats(since: Date) {
    const result = await this.db
      .select({
        total: sql<number>`count(*)`,
        newLeads: sql<number>`count(*) filter (where status = 'new')`,
        contactedLeads: sql<number>`count(*) filter (where status = 'contacted')`,
        convertedLeads: sql<number>`count(*) filter (where status = 'converted')`
      })
      .from(leads)
      .where(gte(leads.createdAt, since));

    return result[0];
  }

  private async getUserStats(since: Date) {
    const result = await this.db
      .select({
        total: sql<number>`count(*)`,
        newUsers: sql<number>`count(*) filter (where created_at >= ${since})`
      })
      .from(users);

    return result[0];
  }

  private async getProjectViewStats(since: Date) {
    const result = await this.db
      .select({
        total: sql<number>`count(*)`,
        recentViews: sql<number>`count(*) filter (where viewed_at >= ${since})`
      })
      .from(projectViews);

    return result[0];
  }

  private async getTopProjects(since: Date) {
    return await this.db
      .select({
        projectId: projectViews.projectId,
        projectName: projects.name,
        viewCount: sql<number>`count(*)`
      })
      .from(projectViews)
      .innerJoin(projects, eq(projects.id, projectViews.projectId))
      .where(gte(projectViews.viewedAt, since))
      .groupBy(projectViews.projectId, projects.name)
      .orderBy(desc(sql`count(*)`))
      .limit(10);
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 12);
  }
}