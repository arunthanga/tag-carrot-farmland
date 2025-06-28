import { pgTable, text, integer, boolean, timestamp, decimal, jsonb, varchar, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Projects table with enhanced fields
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  location: text('location').notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),
  projectType: varchar('project_type', { length: 50 }).notNull(), // coconut, spice, backwater
  totalArea: decimal('total_area', { precision: 10, scale: 2 }), // in acres
  availableArea: decimal('available_area', { precision: 10, scale: 2 }),
  pricePerSqFt: decimal('price_per_sq_ft', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 15, scale: 2 }),
  coordinates: jsonb('coordinates').$type<{ lat: number; lng: number }>(),
  amenities: jsonb('amenities').$type<string[]>().default([]),
  features: jsonb('features').$type<Record<string, any>>().default({}),
  images: jsonb('images').$type<string[]>().default([]),
  videos: jsonb('videos').$type<string[]>().default([]),
  documents: jsonb('documents').$type<{ name: string; url: string; type: string }[]>().default([]),
  soilType: varchar('soil_type', { length: 100 }),
  waterSource: varchar('water_source', { length: 100 }),
  roadAccess: boolean('road_access').default(true),
  electricityAvailable: boolean('electricity_available').default(true),
  nearbyFacilities: jsonb('nearby_facilities').$type<Record<string, number>>().default({}), // distance in km
  legalStatus: varchar('legal_status', { length: 50 }).default('clear'), // clear, pending, disputed
  approvals: jsonb('approvals').$type<{ name: string; status: string; date?: string }[]>().default([]),
  expectedReturns: jsonb('expected_returns').$type<{ year: number; percentage: number }[]>().default([]),
  maintenanceFee: decimal('maintenance_fee', { precision: 8, scale: 2 }).default('0'),
  managementCompany: text('management_company'),
  contactPerson: text('contact_person'),
  contactPhone: varchar('contact_phone', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  featured: boolean('featured').default(false),
  status: varchar('status', { length: 20 }).default('active'), // active, sold_out, coming_soon, suspended
  launchDate: timestamp('launch_date'),
  completionDate: timestamp('completion_date'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  viewCount: integer('view_count').default(0),
  inquiryCount: integer('inquiry_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id)
}, (table) => ({
  locationIdx: index('idx_projects_location').on(table.location),
  typeIdx: index('idx_projects_type').on(table.projectType),
  featuredIdx: index('idx_projects_featured').on(table.featured),
  statusIdx: index('idx_projects_status').on(table.status),
  priceIdx: index('idx_projects_price').on(table.pricePerSqFt),
  stateIdx: index('idx_projects_state').on(table.state),
  slugIdx: index('idx_projects_slug').on(table.slug)
}));

// Enhanced leads table with better tracking
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  alternatePhone: varchar('alternate_phone', { length: 20 }),
  location: text('location').notNull(),
  projectInterest: uuid('project_interest').references(() => projects.id),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  investmentTimeframe: varchar('investment_timeframe', { length: 50 }), // immediate, 3_months, 6_months, 1_year
  preferredLocation: text('preferred_location'),
  message: text('message'),
  source: varchar('source', { length: 50 }).default('website'), // website, social, referral, advertisement
  medium: varchar('medium', { length: 50 }), // organic, cpc, email, social
  campaign: varchar('campaign', { length: 100 }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),
  utmTerm: varchar('utm_term', { length: 100 }),
  utmContent: varchar('utm_content', { length: 100 }),
  referrer: text('referrer'),
  landingPage: text('landing_page'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  browserInfo: jsonb('browser_info').$type<Record<string, any>>().default({}),
  deviceInfo: jsonb('device_info').$type<Record<string, any>>().default({}),
  geoLocation: jsonb('geo_location').$type<{ city?: string; state?: string; country?: string }>().default({}),
  status: varchar('status', { length: 20 }).default('new'), // new, contacted, qualified, converted, lost
  priority: varchar('priority', { length: 10 }).default('medium'), // low, medium, high, urgent
  assignedTo: uuid('assigned_to').references(() => users.id),
  qualificationScore: integer('qualification_score').default(0),
  tags: jsonb('tags').$type<string[]>().default([]),
  notes: text('notes'),
  followUpDate: timestamp('follow_up_date'),
  lastContactDate: timestamp('last_contact_date'),
  conversionDate: timestamp('conversion_date'),
  conversionValue: decimal('conversion_value', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  emailIdx: index('idx_leads_email').on(table.email),
  statusIdx: index('idx_leads_status').on(table.status),
  sourceIdx: index('idx_leads_source').on(table.source),
  createdAtIdx: index('idx_leads_created_at').on(table.createdAt),
  assignedToIdx: index('idx_leads_assigned_to').on(table.assignedTo),
  followUpIdx: index('idx_leads_follow_up').on(table.followUpDate)
}));

// Enhanced users table with roles and permissions
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  password: text('password').notNull(),
  role: varchar('role', { length: 20 }).default('customer'), // customer, agent, admin, super_admin
  permissions: jsonb('permissions').$type<string[]>().default([]),
  profile: jsonb('profile').$type<{
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    occupation?: string;
    company?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    }
  }>().default({}),
  preferences: jsonb('preferences').$type<{
    language?: string;
    currency?: string;
    notifications?: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
    marketing?: boolean;
  }>().default({}),
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  phoneVerificationToken: text('phone_verification_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  lastLoginAt: timestamp('last_login_at'),
  loginCount: integer('login_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role),
  activeIdx: index('idx_users_active').on(table.isActive)
}));

// Enhanced blog posts table
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  images: jsonb('images').$type<string[]>().default([]),
  category: varchar('category', { length: 100 }).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  author: uuid('author').references(() => users.id).notNull(),
  coAuthors: jsonb('co_authors').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  published: boolean('published').default(false),
  scheduledAt: timestamp('scheduled_at'),
  publishedAt: timestamp('published_at'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  readingTime: integer('reading_time'), // in minutes
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  shareCount: integer('share_count').default(0),
  commentCount: integer('comment_count').default(0),
  language: varchar('language', { length: 5 }).default('en'),
  translations: jsonb('translations').$type<Record<string, string>>().default({}), // language -> translated slug
  relatedPosts: jsonb('related_posts').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  slugIdx: index('idx_blog_posts_slug').on(table.slug),
  categoryIdx: index('idx_blog_posts_category').on(table.category),
  authorIdx: index('idx_blog_posts_author').on(table.author),
  publishedIdx: index('idx_blog_posts_published').on(table.published),
  publishedAtIdx: index('idx_blog_posts_published_at').on(table.publishedAt),
  featuredIdx: index('idx_blog_posts_featured').on(table.featured)
}));

// Enhanced testimonials table
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  designation: text('designation'),
  company: text('company'),
  location: text('location'),
  avatar: text('avatar'),
  rating: integer('rating').notNull(), // 1-5 stars
  title: text('title'),
  content: text('content').notNull(),
  projectId: uuid('project_id').references(() => projects.id),
  featured: boolean('featured').default(false),
  verified: boolean('verified').default(false),
  videoTestimonial: text('video_testimonial'),
  images: jsonb('images').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  source: varchar('source', { length: 50 }).default('direct'), // direct, google, facebook, etc.
  originalUrl: text('original_url'),
  isPublic: boolean('is_public').default(true),
  language: varchar('language', { length: 5 }).default('en'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  featuredIdx: index('idx_testimonials_featured').on(table.featured),
  projectIdx: index('idx_testimonials_project').on(table.projectId),
  ratingIdx: index('idx_testimonials_rating').on(table.rating),
  verifiedIdx: index('idx_testimonials_verified').on(table.verified)
}));

// Project views tracking
export const projectViews = pgTable('project_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // null for anonymous users
  sessionId: varchar('session_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
  timeSpent: integer('time_spent'), // in seconds
  bounced: boolean('bounced').default(false),
  converted: boolean('converted').default(false),
  deviceType: varchar('device_type', { length: 20 }), // desktop, mobile, tablet
  browserName: varchar('browser_name', { length: 50 }),
  osName: varchar('os_name', { length: 50 }),
  geoLocation: jsonb('geo_location').$type<{ city?: string; state?: string; country?: string }>().default({})
}, (table) => ({
  projectIdx: index('idx_project_views_project').on(table.projectId),
  userIdx: index('idx_project_views_user').on(table.userId),
  viewedAtIdx: index('idx_project_views_viewed_at').on(table.viewedAt),
  sessionIdx: index('idx_project_views_session').on(table.sessionId)
}));

// Analytics events
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  event: varchar('event', { length: 100 }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 255 }),
  projectId: uuid('project_id').references(() => projects.id),
  leadId: uuid('lead_id').references(() => leads.id),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  page: text('page'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  eventIdx: index('idx_analytics_event').on(table.event),
  userIdx: index('idx_analytics_user').on(table.userId),
  projectIdx: index('idx_analytics_project').on(table.projectId),
  createdAtIdx: index('idx_analytics_created_at').on(table.createdAt)
}));

// Lead activities/timeline
export const leadActivities = pgTable('lead_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leads.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // who performed the activity
  activityType: varchar('activity_type', { length: 50 }).notNull(), // call, email, meeting, note, status_change
  title: text('title').notNull(),
  description: text('description'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  leadIdx: index('idx_lead_activities_lead').on(table.leadId),
  typeIdx: index('idx_lead_activities_type').on(table.activityType),
  scheduledIdx: index('idx_lead_activities_scheduled').on(table.scheduledAt)
}));

// Email campaigns
export const emailCampaigns = pgTable('email_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  templateId: text('template_id'),
  segmentId: uuid('segment_id'),
  status: varchar('status', { length: 20 }).default('draft'), // draft, scheduled, sent, cancelled
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  totalRecipients: integer('total_recipients').default(0),
  deliveredCount: integer('delivered_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  bounceCount: integer('bounce_count').default(0),
  unsubscribeCount: integer('unsubscribe_count').default(0),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Email campaign recipients
export const emailRecipients = pgTable('email_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => emailCampaigns.id).notNull(),
  leadId: uuid('lead_id').references(() => leads.id),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, sent, delivered, opened, clicked, bounced
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  bouncedAt: timestamp('bounced_at'),
  bounceReason: text('bounce_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// System notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // info, success, warning, error
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  expiresAt: timestamp('expires_at'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdx: index('idx_notifications_user').on(table.userId),
  readIdx: index('idx_notifications_read').on(table.isRead),
  typeIdx: index('idx_notifications_type').on(table.type)
}));

// Define relationships
export const projectsRelations = relations(projects, ({ many, one }) => ({
  views: many(projectViews),
  leads: many(leads),
  testimonials: many(testimonials),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id]
  }),
  updater: one(users, {
    fields: [projects.updatedBy],
    references: [users.id]
  })
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  project: one(projects, {
    fields: [leads.projectInterest],
    references: [projects.id]
  }),
  assignedUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id]
  }),
  activities: many(leadActivities)
}));

export const usersRelations = relations(users, ({ many }) => ({
  createdProjects: many(projects),
  assignedLeads: many(leads),
  blogPosts: many(blogPosts),
  notifications: many(notifications),
  projectViews: many(projectViews)
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.author],
    references: [users.id]
  })
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  project: one(projects, {
    fields: [testimonials.projectId],
    references: [projects.id]
  })
}));

export const projectViewsRelations = relations(projectViews, ({ one }) => ({
  project: one(projects, {
    fields: [projectViews.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [projectViews.userId],
    references: [users.id]
  })
}));

export const leadActivitiesRelations = relations(leadActivities, ({ one }) => ({
  lead: one(leads, {
    fields: [leadActivities.leadId],
    references: [leads.id]
  }),
  user: one(users, {
    fields: [leadActivities.userId],
    references: [users.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));