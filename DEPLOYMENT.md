# Tag Carrot Deployment Guide

## Production Deployment Checklist

### 1. Pre-deployment Setup

**Environment Configuration**
```bash
# Create production .env file
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
PORT=80
```

**Database Migration**
```bash
# Push schema to production database
npm run db:push
```

### 2. Switch to Database Storage

Replace in-memory storage with PostgreSQL:

**server/routes.ts**
```typescript
// Replace this line:
// import { storage } from './storage';

// With this:
import { DatabaseStorage } from './database-storage';
export const storage = new DatabaseStorage();
```

### 3. Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### 4. Content Management

**Add Your Projects**
Update project data either in:
1. Database directly via SQL
2. Admin interface (if built)
3. Seed script (recommended)

**Sample Project Insert**
```sql
INSERT INTO projects (name, slug, location, price_per_sq_ft, project_type, description, features, expected_returns, water_availability, cottage_permitted, image_url, coordinates, is_active, is_featured)
VALUES (
  'Your Project Name',
  'your-project-slug',
  'Your Location, State',
  '299',
  'coconut',
  'Your project description',
  ARRAY['Feature 1', 'Feature 2'],
  '15-18%',
  'Bore well available',
  true,
  'https://your-image-url.com/image.jpg',
  '{"lat": 10.123, "lng": 76.456}',
  true,
  true
);
```

### 5. Server Deployment Options

**Option A: VPS/Cloud Server**
```bash
# Using PM2 for process management
npm install -g pm2
pm2 start server/index.ts --name tag-carrot
pm2 startup
pm2 save
```

**Option B: Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npm", "start"]
```

**Option C: Platform Deployment**
- **Vercel**: Connect GitHub repo, auto-deploys
- **Heroku**: `git push heroku main`
- **DigitalOcean App Platform**: Connect repo
- **AWS/GCP**: Use their Node.js services

### 6. Domain & SSL Setup

**DNS Configuration**
```
A Record: @ -> Your Server IP
CNAME Record: www -> yourdomain.com
```

**SSL Certificate (Let's Encrypt)**
```bash
# Using Nginx
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7. Performance Optimization

**Nginx Configuration** (`/etc/nginx/sites-available/tagcarrot`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /attached_assets/ {
        alias /path/to/your/app/attached_assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 8. Monitoring & Maintenance

**Application Monitoring**
```bash
# Check application status
pm2 status

# View logs
pm2 logs tag-carrot

# Restart application
pm2 restart tag-carrot
```

**Database Backup**
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20250624.sql
```

### 9. Security Considerations

**Environment Variables**
- Never commit `.env` files
- Use environment-specific configurations
- Rotate database passwords regularly

**API Security**
- Implement rate limiting
- Add CORS configuration for production domains
- Use HTTPS only in production

**Database Security**
- Use connection pooling
- Implement proper user permissions
- Regular security updates

### 10. Post-Deployment Testing

**Functionality Checklist**
- [ ] Homepage loads with correct branding
- [ ] Project listings display properly
- [ ] Interactive map shows project locations
- [ ] Lead capture forms submit successfully
- [ ] Multi-language switching works
- [ ] Mobile responsiveness
- [ ] Database connections stable
- [ ] SSL certificate valid
- [ ] Performance metrics acceptable

### 11. Content Updates

**Adding New Projects**
1. Prepare project images and upload to CDN
2. Insert project data into database
3. Update any static references if needed
4. Test project detail pages

**Blog Management**
1. Insert blog posts via admin interface or direct DB
2. Ensure images are optimized
3. Update navigation if needed

### 12. Scaling Considerations

**Traffic Growth**
- CDN for static assets
- Database read replicas
- Load balancing for multiple servers
- Caching strategies (Redis)

**Feature Expansion**
- User authentication system
- Payment integration
- Admin dashboard
- Analytics integration

---

Your Tag Carrot platform is now ready for independent deployment with your authentic content. The modular architecture allows for easy customization and scaling as your business grows.