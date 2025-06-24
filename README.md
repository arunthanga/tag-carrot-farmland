# Tag Carrot - Premium Managed Farmland Investment Platform

A full-stack web application for premium managed farmland investments across Kerala and Tamil Nadu, featuring interactive maps, multilingual support, and comprehensive lead management.

## 🌟 Features

- **Interactive Map**: Explore farmland projects across Kerala & Tamil Nadu
- **Multi-language Support**: English, Malayalam, and Tamil with auto-detection
- **Database Integration**: PostgreSQL with Drizzle ORM
- **Lead Management**: Comprehensive contact and user management system
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Modern React with TanStack Query

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and setup**
```bash
git clone <your-repo>
cd tag-carrot
npm install
```

2. **Environment Setup**
Create `.env` file with your database connection:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/tagcarrot
```

3. **Database Setup**
```bash
npm run db:push
```

4. **Development Server**
```bash
npm run dev
```

Visit `http://localhost:5000` to see your application.

## 📁 Project Structure

```
tag-carrot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # In-memory storage (development)
│   ├── database-storage.ts # PostgreSQL storage (production)
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── attached_assets/       # Static assets including logo
```

## 🗄️ Database Schema

### Core Tables
- **projects**: Farmland investment opportunities
- **leads**: Customer inquiries and contacts
- **users**: Registered user accounts
- **blog_posts**: Content management
- **testimonials**: Customer reviews

## 🌐 API Endpoints

### Projects
- `GET /api/projects` - All projects
- `GET /api/projects/featured` - Featured projects
- `GET /api/projects/:slug` - Project by slug

### Leads & Users
- `POST /api/leads` - Create lead
- `POST /api/users` - Create user account
- `GET /api/leads` - Get all leads (admin)

### Content
- `GET /api/blog` - Blog posts
- `GET /api/testimonials` - Customer testimonials

## 🎨 Customization

### Brand Colors (Tailwind CSS)
- **Coral**: Primary accent color
- **Sage**: Secondary green
- **Forest**: Dark text color
- **Cream**: Background color
- **Teal-dark**: Accent color

### Logo
Your custom Tag Carrot logo is located at:
`/attached_assets/TagCarrot_1750742244492.png`

### Content Management
Update project data in `server/storage.ts` or switch to database storage by:
1. Uncomment database import in `server/routes.ts`
2. Replace `MemStorage` with `DatabaseStorage`

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Database Migration
For production, switch to database storage:
```typescript
// In server/routes.ts
import { DatabaseStorage } from './database-storage';
export const storage = new DatabaseStorage();
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
PORT=80
```

## 🌍 Multi-language Support

The application automatically detects browser language and supports:
- **English** (default)
- **Malayalam** (ml)
- **Tamil** (ta)

Translation keys are managed in `client/src/lib/translations.ts`.

## 📝 Content Updates

### Adding New Projects
Update the project data in `server/storage.ts` or add to database:
```typescript
{
  name: "Your Project Name",
  location: "Location, State",
  pricePerSqFt: "999",
  projectType: "coconut", // or "spice", "backwater"
  coordinates: { lat: 10.123, lng: 76.456 },
  // ... other fields
}
```

### Blog Posts & Testimonials
Similar patterns for adding blog content and customer testimonials.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Routing**: Wouter (lightweight routing)
- **Build Tool**: Vite

## 📞 Support

For questions about deployment or customization, refer to the comprehensive documentation in `replit.md` or contact your development team.

---

**Tag Carrot** - Premium Managed Farmland Investments
*Ready for independent deployment with your authentic content*