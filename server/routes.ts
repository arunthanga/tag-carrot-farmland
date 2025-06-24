import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/featured", async (req, res) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });

  app.get("/api/projects/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const project = await storage.getProjectBySlug(slug);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Leads endpoints
  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid lead data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // Blog posts endpoints
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post || !post.isPublished) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Testimonials endpoints
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getActiveTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Call tracking endpoint
  app.post("/api/call-tracking", async (req, res) => {
    try {
      const { phoneNumber, leadId, source } = req.body;
      
      // TODO: Implement call tracking and sentiment analysis
      // This would integrate with a telephony service like Twilio
      // and sentiment analysis service
      
      res.json({ 
        message: "Call initiated", 
        callId: `call_${Date.now()}`,
        phoneNumber: "+919876543210"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate call" });
    }
  });

  // Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, language } = req.body;
      
      // Simple chatbot responses based on keywords
      const responses = {
        en: {
          default: "Thank you for your interest in Tag Carrot farmland. How can I help you today?",
          pricing: "Our farmland prices start from ₹199 per sq ft for Ghat Coco Idyll. Would you like details about specific projects?",
          location: "We have premium farmland projects in Kerala and Tamil Nadu, including Wayanad, Munnar, and Alleppey.",
          cottage: "Yes, cottage construction is permitted on all our farmland projects with proper approvals.",
          returns: "Our managed farmland offers 12-22% annual returns depending on the project and crop type.",
        },
        ml: {
          default: "ടാഗ് കാരറ്റ് ഫാം ലാൻഡിൽ താങ്കളുടെ താൽപ്പര്യത്തിന് നന്ദി. ഞാൻ എങ്ങനെ സഹായിക്കാം?",
          pricing: "ഞങ്ങളുടെ ഫാം ലാൻഡ് വില ഘാറ്റ് കോക്കോ ഇഡിൽ പ്രോജക്ടിന് ഒരു ചതുരശ്ര അടിക്ക് ₹199 മുതൽ ആരംഭിക്കുന്നു.",
          location: "ഞങ്ങൾക്ക് കേരളത്തിലും തമിഴ്‌നാട്ടിലും പ്രീമിയം ഫാം ലാൻഡ് പദ്ധതികളുണ്ട്.",
          cottage: "ഞങ്ങളുടെ എല്ലാ ഫാം ലാൻഡ് പ്രോജക്ടുകളിലും കോട്ടേജ് നിർമ്മാണം അനുവദിച്ചിരിക്കുന്നു.",
          returns: "ഞങ്ങളുടെ മാനേജ്ഡ് ഫാം ലാൻഡ് 12-22% വാർഷിക വരുമാനം നൽകുന്നു.",
        },
        ta: {
          default: "டேக் கேரட் பண்ணை நிலத்தில் உங்கள் ஆர்வத்திற்கு நன்றி. நான் எப்படி உதவ முடியும்?",
          pricing: "எங்கள் பண்ணை நிலத்தின் விலை காட் கோகோ இடில் திட்டத்திற்கு ஒரு சதுர அடிக்கு ₹199 முதல் தொடங்குகிறது.",
          location: "எங்களிடம் கேரளா மற்றும் தமிழ்நாட்டில் பிரீமியம் பண்ணை நில திட்டங்கள் உள்ளன.",
          cottage: "எங்கள் அனைத்து பண்ணை நில திட்டங்களிலும் குடிசை கட்டுமானம் அனுமதிக்கப்பட்டுள்ளது.",
          returns: "எங்கள் நிர்வகிக்கப்பட்ட பண்ணை நிலம் 12-22% வருடாந்திர வருமானத்தை வழங்குகிறது.",
        }
      };

      const langResponses = responses[language as keyof typeof responses] || responses.en;
      
      let response = langResponses.default;
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        response = langResponses.pricing || langResponses.default;
      } else if (lowerMessage.includes('location') || lowerMessage.includes('where')) {
        response = (langResponses as any).location || langResponses.default;
      } else if (lowerMessage.includes('cottage') || lowerMessage.includes('house')) {
        response = (langResponses as any).cottage || langResponses.default;
      } else if (lowerMessage.includes('return') || lowerMessage.includes('profit')) {
        response = (langResponses as any).returns || langResponses.default;
      }

      res.json({ response, suggestions: ["View Projects", "Schedule Visit", "Call Now"] });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chatbot request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
