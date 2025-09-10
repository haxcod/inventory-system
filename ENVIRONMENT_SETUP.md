# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database Configuration
```bash
MONGODB_URI=mongodb://localhost:27017/inventory_management
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/inventory_management
```

### JWT Configuration
```bash
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_EXPIRES_IN=7d
```

### Next.js Configuration
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### Application Configuration
```bash
NODE_ENV=development
PORT=3000
```

## Optional Environment Variables

### Email Configuration (for notifications)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Inventory Management <noreply@yourcompany.com>
```

### File Upload Configuration
```bash
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### Redis Configuration (for caching and sessions)
```bash
REDIS_URL=redis://localhost:6379
```

### Payment Gateway Configuration (if using)
```bash
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Cloud Storage Configuration (if using)
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-inventory-bucket
```

### Analytics and Monitoring
```bash
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
SENTRY_DSN=your_sentry_dsn_here
```

### Security Configuration
```bash
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Feature Flags
```bash
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_ANALYTICS=true
ENABLE_AI_FEATURES=false
```

## Setup Instructions

1. **Copy the environment template:**
   ```bash
   cp ENVIRONMENT_SETUP.md .env.local
   ```

2. **Edit `.env.local` with your actual values:**
   - Replace placeholder values with your actual configuration
   - Generate a strong JWT secret (minimum 32 characters)
   - Set up your MongoDB connection string

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Security Notes

- Never commit `.env.local` or `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use environment-specific configurations for different deployments

## Production Deployment

For production deployment, set these environment variables in your hosting platform:

- **Vercel**: Use the dashboard to set environment variables
- **Railway**: Use the environment variables section
- **Heroku**: Use `heroku config:set KEY=value`
- **Docker**: Use environment files or docker-compose.yml

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**: Check your MONGODB_URI format
2. **JWT Error**: Ensure JWT_SECRET is at least 32 characters
3. **Port Already in Use**: Change PORT to a different number
4. **File Upload Issues**: Check MAX_FILE_SIZE and ALLOWED_FILE_TYPES

### Development vs Production

- **Development**: Use local MongoDB and simple configurations
- **Production**: Use MongoDB Atlas, strong secrets, and proper security settings
