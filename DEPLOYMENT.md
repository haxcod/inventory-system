# Deployment Guide

This guide will help you deploy the Inventory Management System to production.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account
- MongoDB Atlas account

### Step 1: Prepare Your Repository

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Set Environment Variables

In the Vercel dashboard, go to Settings > Environment Variables and add:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NEXTAUTH_SECRET=your-nextauth-secret-here-make-it-long-and-random
NEXTAUTH_URL=https://your-app-name.vercel.app
NODE_ENV=production
APP_URL=https://your-app-name.vercel.app
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## 🗄️ MongoDB Atlas Setup

### Step 1: Create Cluster

1. **Sign up for MongoDB Atlas**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account

2. **Create a New Cluster**
   - Choose "Free" tier
   - Select your preferred region
   - Name your cluster (e.g., "inventory-cluster")

### Step 2: Configure Database Access

1. **Create Database User**
   - Go to Database Access
   - Click "Add New Database User"
   - Username: `inventory-user`
   - Password: Generate a secure password
   - Database User Privileges: "Read and write to any database"

2. **Whitelist IP Addresses**
   - Go to Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` for all IPs (or specific IPs for security)

### Step 3: Get Connection String

1. **Go to Clusters**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `inventory_db`

## 🔧 Alternative Deployment Options

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t inventory-system .
   docker run -p 3000:3000 --env-file .env inventory-system
   ```

### AWS Deployment

1. **Using AWS Amplify**
   - Connect your GitHub repository
   - Configure build settings
   - Set environment variables
   - Deploy

2. **Using EC2**
   - Launch EC2 instance
   - Install Node.js and PM2
   - Clone repository
   - Install dependencies
   - Build application
   - Start with PM2

### DigitalOcean App Platform

1. **Create New App**
   - Connect GitHub repository
   - Select "Web Service"
   - Configure build settings

2. **Set Environment Variables**
   - Add all required environment variables
   - Deploy

## 🔒 Security Considerations

### Environment Variables
- Use strong, unique secrets for JWT_SECRET and NEXTAUTH_SECRET
- Never commit .env files to version control
- Use different secrets for different environments

### Database Security
- Use strong database passwords
- Whitelist only necessary IP addresses
- Enable MongoDB Atlas security features
- Regular security updates

### Application Security
- Enable HTTPS in production
- Use secure cookies
- Implement rate limiting
- Regular security audits

## 📊 Monitoring and Maintenance

### Health Checks
- Monitor application uptime
- Set up alerts for errors
- Monitor database performance
- Track user activity

### Backups
- Enable MongoDB Atlas backups
- Regular database exports
- Code repository backups
- Environment variable backups

### Updates
- Regular dependency updates
- Security patches
- Feature updates
- Performance optimizations

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors
- Review build logs

**Database Connection Issues**
- Verify MongoDB Atlas connection string
- Check IP whitelist
- Verify database user permissions
- Check network connectivity

**Authentication Issues**
- Verify JWT_SECRET is set
- Check cookie settings
- Verify NEXTAUTH_URL matches deployment URL
- Clear browser cookies

**Performance Issues**
- Monitor database queries
- Check API response times
- Optimize images and assets
- Use CDN for static assets

### Getting Help

1. **Check Logs**
   - Vercel function logs
   - MongoDB Atlas logs
   - Browser console errors

2. **Debug Mode**
   - Enable debug logging
   - Check network requests
   - Verify environment variables

3. **Support**
   - Check documentation
   - Search existing issues
   - Create support ticket

## 📈 Scaling

### Horizontal Scaling
- Use multiple Vercel regions
- Implement database sharding
- Use CDN for static assets
- Load balancing

### Vertical Scaling
- Upgrade Vercel plan
- Increase MongoDB Atlas tier
- Optimize database queries
- Implement caching

### Performance Optimization
- Image optimization
- Code splitting
- Lazy loading
- Database indexing

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

### Automated Deployments
- Deploy on every push to main
- Run tests before deployment
- Automatic rollback on failure
- Environment-specific deployments

---

For more detailed information, refer to the main README.md file or contact support.

