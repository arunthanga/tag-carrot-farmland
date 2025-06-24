# Tag Carrot Setup Guide

## GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in with `mailarunthangavel@gmail.com`
2. Click "New Repository"
3. Repository name: `tag-carrot-farmland`
4. Description: "Premium managed farmland investment platform"
5. Set to Public or Private as preferred
6. **Do not** initialize with README (we have one)
7. Click "Create Repository"

### 2. Push to GitHub

```bash
# Add remote origin
git remote add origin https://github.com/mailarunthangavel/tag-carrot-farmland.git

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Tag Carrot farmland investment platform

- Full-stack React + Express application
- PostgreSQL database with Drizzle ORM
- Multi-language support (English, Malayalam, Tamil)
- Interactive map with project locations
- Lead capture and user management
- Tag Carrot logo integration
- Responsive design with Tailwind CSS"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Repository Settings

**Branch Protection (Optional)**
- Go to Settings > Branches
- Add rule for `main` branch
- Enable "Require pull request reviews"

**Secrets for Deployment**
If using GitHub Actions, add secrets:
- `DATABASE_URL`
- `NODE_ENV`
- Other environment variables

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Quick Start
```bash
git clone https://github.com/mailarunthangavel/tag-carrot-farmland.git
cd tag-carrot-farmland
npm install
cp .env.example .env
# Edit .env with your database details
npm run db:push
npm run dev
```

## Project Structure Overview

```
tag-carrot-farmland/
├── README.md              # Main documentation
├── DEPLOYMENT.md          # Production deployment guide
├── SETUP.md              # This file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
├── client/              # React frontend
├── server/              # Express backend
├── shared/              # Shared types and schemas
├── attached_assets/     # Logo and static files
└── drizzle.config.ts   # Database configuration
```

## Next Steps

1. **Customize Content**: Update project data in `server/storage.ts`
2. **Add Your Branding**: Replace sample content with authentic data
3. **Database Setup**: Configure PostgreSQL for production
4. **Domain Setup**: Configure custom domain and SSL
5. **Deployment**: Follow DEPLOYMENT.md for production setup

## Support

For questions about the codebase:
- Check README.md for general information
- Check DEPLOYMENT.md for production setup
- Review code comments for implementation details

Your Tag Carrot platform is ready for independent development and deployment!