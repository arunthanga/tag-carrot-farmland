import { 
  projects, 
  leads, 
  blogPosts, 
  testimonials,
  type Project, 
  type Lead, 
  type BlogPost, 
  type Testimonial,
  type InsertProject, 
  type InsertLead, 
  type InsertBlogPost, 
  type InsertTestimonial 
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getFeaturedProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;

  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;

  // Users
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  getActiveTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private leads: Map<number, Lead>;
  private users: Map<number, User>;
  private blogPosts: Map<number, BlogPost>;
  private testimonials: Map<number, Testimonial>;
  private currentProjectId: number;
  private currentLeadId: number;
  private currentUserId: number;
  private currentBlogPostId: number;
  private currentTestimonialId: number;

  constructor() {
    this.projects = new Map();
    this.leads = new Map();
    this.users = new Map();
    this.blogPosts = new Map();
    this.testimonials = new Map();
    this.currentProjectId = 1;
    this.currentLeadId = 1;
    this.currentUserId = 1;
    this.currentBlogPostId = 1;
    this.currentTestimonialId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Initialize projects
    const sampleProjects: InsertProject[] = [
      {
        name: "Ghat Coco Idyll",
        slug: "ghat-coco-idyll",
        location: "Wayanad, Kerala",
        pricePerSqFt: "199",
        projectType: "coconut",
        description: "Premium coconut farmland in the Western Ghats with cottage construction potential",
        features: ["Cottage Construction Approved", "Coconut Plantation", "Western Ghats Location", "Weekend Farming"],
        expectedReturns: "12-15%",
        waterAvailability: "Bore well",
        cottagePermitted: true,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        coordinates: { lat: 11.6854, lng: 76.1320 },
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Malabar Spice Gardens",
        slug: "malabar-spice-gardens",
        location: "Wayanad, Kerala",
        pricePerSqFt: "245",
        projectType: "spice",
        description: "Aromatic spice plantations with premium cardamom and pepper cultivation",
        features: ["Spice Plantation", "Cardamom Cultivation", "Pepper Vines", "Organic Farming"],
        expectedReturns: "15-18%",
        waterAvailability: "Natural springs",
        cottagePermitted: true,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        coordinates: { lat: 11.7401, lng: 76.1734 },
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Backwater Bliss",
        slug: "backwater-bliss",
        location: "Alleppey, Kerala",
        pricePerSqFt: "320",
        projectType: "backwater",
        description: "Waterfront farmland ideal for aquaculture and weekend retreats",
        features: ["Backwater Access", "Aquaculture Potential", "Waterfront Views", "Traditional Architecture"],
        expectedReturns: "18-22%",
        waterAvailability: "Backwater access",
        cottagePermitted: true,
        imageUrl: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        coordinates: { lat: 9.4981, lng: 76.3388 },
        isActive: true,
        isFeatured: true,
      },
      {
        name: "Hill Station Retreat",
        slug: "hill-station-retreat",
        location: "Munnar, Kerala",
        pricePerSqFt: "280",
        projectType: "hill-station",
        description: "Cool climate farmland perfect for tea cultivation and cottages",
        features: ["Tea Plantation", "Cool Climate", "Mountain Views", "Hill Station Location"],
        expectedReturns: "14-17%",
        waterAvailability: "Mountain streams",
        cottagePermitted: true,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        coordinates: { lat: 10.0889, lng: 77.0595 },
        isActive: true,
        isFeatured: false,
      },
    ];

    sampleProjects.forEach(project => {
      this.createProject(project);
    });

    // Initialize blog posts
    const sampleBlogPosts: InsertBlogPost[] = [
      {
        title: "Weekend Farming: A Complete Beginner's Guide",
        slug: "weekend-farming-beginners-guide",
        excerpt: "Learn how to make the most of your farmland visits with practical weekend farming activities that the whole family can enjoy.",
        content: "Complete guide content here...",
        category: "Farming Tips",
        readTime: 5,
        imageUrl: "https://images.unsplash.com/photo-1592659762303-90081d34b277?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        isPublished: true,
      },
      {
        title: "Building Your Dream Cottage on Farmland",
        slug: "building-cottage-on-farmland",
        excerpt: "Essential permits, design considerations, and cost-effective approaches to construct your weekend cottage on agricultural land.",
        content: "Complete guide content here...",
        category: "Construction",
        readTime: 8,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        isPublished: true,
      },
      {
        title: "Maximizing Returns from Managed Farmland",
        slug: "maximizing-farmland-returns",
        excerpt: "Strategic insights on crop selection, seasonal planning, and income optimization for your managed farmland investment.",
        content: "Complete guide content here...",
        category: "Investment",
        readTime: 6,
        imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
        isPublished: true,
      },
    ];

    sampleBlogPosts.forEach(post => {
      this.createBlogPost(post);
    });

    // Initialize testimonials
    const sampleTestimonials: InsertTestimonial[] = [
      {
        name: "Rajesh Srinivasan",
        title: "Software Engineer, Bangalore",
        content: "Our weekend cottage at Ghat Coco Idyll has become our family's favorite retreat. The managed farmland gives us steady returns while we enjoy organic farming as a hobby.",
        rating: 5,
        projectId: 1,
        isActive: true,
      },
      {
        name: "Priya Menon",
        title: "Doctor, Chennai",
        content: "The spice plantation investment has exceeded our expectations. Professional management means we get steady income without any farming experience required.",
        rating: 5,
        projectId: 2,
        isActive: true,
      },
      {
        name: "Arun Kumar",
        title: "Entrepreneur, Mumbai",
        content: "Tag Carrot's transparency and professional approach convinced us. The backwater property is not just an investment but our weekend paradise.",
        rating: 5,
        projectId: 3,
        isActive: true,
      },
    ];

    sampleTestimonials.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.isActive);
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.isActive && p.isFeatured);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(p => p.slug === slug);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      features: Array.isArray(insertProject.features) ? insertProject.features : [],
      isActive: insertProject.isActive ?? true,
      isFeatured: insertProject.isFeatured ?? false
    };
    this.projects.set(id, project);
    return project;
  }

  // Leads
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = { 
      ...insertLead, 
      id, 
      source: insertLead.source || "website",
      language: insertLead.language || "en",
      projectInterest: insertLead.projectInterest ?? null,
      budget: insertLead.budget ?? null,
      purpose: insertLead.purpose ?? null,
      requirements: insertLead.requirements ?? null,
      createdAt: new Date()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentUserId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(p => p.isPublished);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(p => p.slug === slug);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const post: BlogPost = { 
      ...insertPost, 
      id, 
      isPublished: insertPost.isPublished ?? false,
      createdAt: new Date()
    };
    this.blogPosts.set(id, post);
    return post;
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getActiveTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(t => t.isActive);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentTestimonialId++;
    const testimonial: Testimonial = { 
      ...insertTestimonial, 
      id,
      rating: insertTestimonial.rating ?? 5,
      isActive: insertTestimonial.isActive ?? true,
      projectId: insertTestimonial.projectId ?? null
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
}

export const storage = new MemStorage();
