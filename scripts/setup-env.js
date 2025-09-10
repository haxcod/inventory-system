const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-123456789
JWT_EXPIRES_IN=7d

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here-123456789

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here-123456789

# Tax Configuration
DEFAULT_TAX_RATE=0.18
CURRENCY=INR

# Company Information
COMPANY_NAME=Inventory Management System
COMPANY_ADDRESS=123 Business Street, City, State 12345
COMPANY_PHONE=+91-1234567890
COMPANY_EMAIL=info@inventorysystem.com
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with default values');
    console.log('📝 Please update the MONGODB_URI with your actual MongoDB connection string');
  } else {
    console.log('⚠️  .env.local file already exists');
  }
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  console.log('\n📋 Please manually create a .env.local file with the following content:');
  console.log(envContent);
}
