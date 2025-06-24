# Tag Carrot - Premium Managed Farmland Investment Platform

## Overview

Tag Carrot is a full-stack web application for premium managed farmland investments across Kerala and Tamil Nadu. The platform allows users to explore investment opportunities, schedule consultations, and manage farmland investments with cottage construction potential. The application features a modern React frontend with multilingual support and a robust Express.js backend.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Development**: Hot module replacement via Vite integration

### Design System
- **Color Palette**: Custom brand colors (coral, sage, teal-dark, warm-beige, cream, forest)
- **Typography**: Inter for English, Noto Sans Malayalam/Tamil for regional languages
- **Components**: Comprehensive UI component library with consistent theming

## Key Components

### Data Models
1. **Projects**: Farmland investment opportunities with location, pricing, and features
2. **Leads**: Customer inquiries and consultation requests
3. **Blog Posts**: Content management for articles and updates
4. **Testimonials**: Customer feedback and success stories

### Core Features
- **Project Discovery**: Interactive map and project listings
- **Lead Capture**: Multilingual contact forms with validation
- **Consultation Scheduling**: Appointment booking system
- **Content Management**: Blog and testimonial systems
- **Chatbot Integration**: Customer support automation

### Multilingual Support
- **Languages**: English (default), Malayalam, Tamil
- **Auto-detection**: Browser language detection with fallback
- **Font Support**: Language-specific font families
- **Translation System**: Key-based translation with context support

## Data Flow

### Frontend to Backend
1. React Query manages API state and caching
2. Form submissions use React Hook Form with Zod validation
3. API requests include proper error handling and loading states
4. Real-time updates through query invalidation

### Database Operations
1. Drizzle ORM provides type-safe database operations
2. Schema definitions shared between frontend and backend
3. Migration system for database version control
4. Connection pooling via Neon Database serverless

### User Journey
1. Landing page with project showcase and lead capture
2. Interactive map for project exploration
3. Detailed project pages with investment information
4. Contact forms for consultation scheduling
5. Blog content for educational resources

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **UI**: @radix-ui components for accessible primitives
- **Forms**: react-hook-form with @hookform/resolvers
- **Validation**: zod for schema validation
- **Routing**: wouter for lightweight routing
- **State**: @tanstack/react-query for server state

### Development Tools
- **Build**: vite with @vitejs/plugin-react
- **TypeScript**: Full type safety across the stack
- **Styling**: tailwindcss with postcss and autoprefixer
- **Runtime**: tsx for TypeScript execution in development

### External Services
- **Maps**: Leaflet for interactive mapping
- **Fonts**: Google Fonts for multilingual typography
- **Analytics**: Google Analytics integration ready
- **Deployment**: Replit with autoscale deployment target

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module integration
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Development on port 5000, production on port 80

### Production Build
- **Frontend**: Vite build outputs to dist/public
- **Backend**: esbuild bundles server code to dist/index.js
- **Static Assets**: Served via Express static middleware
- **Environment**: Production mode with optimized builds

### Scaling Considerations
- **Database**: Serverless PostgreSQL for automatic scaling
- **CDN**: Static asset delivery optimization ready
- **Caching**: Query caching and API response optimization
- **Performance**: Code splitting and lazy loading implemented

## Changelog

```
Changelog:
- June 24, 2025. Initial setup with full-stack React + Express application
- June 24, 2025. Added PostgreSQL database with users, leads, projects tables
- June 24, 2025. Integrated Tag Carrot logo (carrot with map design)
- June 24, 2025. Implemented multi-language support (English, Malayalam, Tamil)
- June 24, 2025. Added interactive map with project locations across Kerala & Tamil Nadu
- June 24, 2025. Created lead capture forms with database storage
- June 24, 2025. Ready for deployment with authentic project data
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Project ready for download and independent deployment.
```