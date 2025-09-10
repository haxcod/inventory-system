# Inventory Management System

A complete, production-ready inventory management system built with Next.js, MongoDB Atlas, and modern web technologies. Features smart billing, voice commands, QR code integration, AI insights, and comprehensive reporting.

## 🚀 Features

### Core Functionality
- **Smart Billing System** - QR code scanning, voice commands, instant invoice generation
- **Product Management** - Complete CRUD operations with QR code generation
- **Inventory Tracking** - Real-time stock updates, low stock alerts, multi-branch support
- **Payment Management** - Khata book functionality with credit/debit tracking
- **Comprehensive Reports** - Sales, stock, and analytics with interactive charts
- **Voice Commands** - Add products and create invoices using voice recognition
- **QR Code Integration** - Generate and scan QR codes for quick product identification

### Advanced Features
- **AI-Powered Insights** - Demand prediction, reorder suggestions, anomaly detection
- **Real-time Notifications** - Low stock alerts, payment reminders, system notifications
- **Multi-branch Support** - Manage multiple locations with branch-specific inventory
- **Role-based Access Control** - Admin and user roles with granular permissions
- **Dark/Light Mode** - Customizable UI with theme switching
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Offline Support** - Queue actions when offline, sync when back online

### Security & Compliance
- **JWT Authentication** - Secure session management with encrypted cookies
- **Password Hashing** - bcrypt encryption for user passwords
- **Audit Logging** - Complete activity tracking with IP and device information
- **Data Validation** - Input sanitization and validation on all endpoints
- **CORS Protection** - Secure API endpoints with proper CORS configuration

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **Recharts** - Interactive charts and graphs
- **Zustand** - State management
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **PDFKit** - PDF generation
- **QRCode** - QR code generation
- **Web Speech API** - Voice recognition

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# App Configuration
NODE_ENV=development
APP_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI/ML (Optional)
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Database Setup
```bash
# Seed the database with sample data
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Environment Variables in Vercel**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string
   - `NEXTAUTH_SECRET` - A secure random string
   - `NEXTAUTH_URL` - Your production URL
   - `NODE_ENV` - production

### Manual Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## 📱 Usage

### Getting Started

1. **Register Admin Account**
   - Visit the registration page
   - Create your admin account
   - You'll have full access to all features

2. **Add Products**
   - Go to Products page
   - Click "Add Product"
   - Fill in product details
   - QR codes are generated automatically

3. **Create Invoices**
   - Go to Billing page
   - Scan QR codes or search for products
   - Add customer information
   - Generate PDF invoices

4. **Track Payments**
   - Go to Payments page
   - Record credit/debit transactions
   - Link payments to invoices
   - Generate account statements

5. **View Reports**
   - Go to Reports page
   - Select report type and period
   - Export data as PDF/CSV
   - View interactive charts

### Voice Commands

Enable voice recognition in the billing page and use these commands:

- "Add 2 bottles of water" - Add product to cart
- "Generate invoice" - Create invoice
- "Clear cart" - Empty the cart
- "Calculate total" - Recalculate totals

### QR Code Usage

1. **Generate QR Codes**
   - Products automatically get QR codes
   - Download/print QR code stickers
   - Place on physical products

2. **Scan QR Codes**
   - Use the QR scanner in billing
   - Products are automatically added to cart
   - Works with any QR code scanner app

## 🔧 Configuration

### User Roles and Permissions

**Admin Role:**
- Full access to all features
- User management
- Branch management
- System settings

**User Role:**
- Product management (limited)
- Billing and invoicing
- Payment tracking
- Report viewing

### Branch Management

- Create multiple branches
- Assign users to specific branches
- Track inventory per branch
- Transfer products between branches

### Notification Settings

- Low stock alerts
- Payment reminders
- System notifications
- Email notifications (optional)

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Billing Endpoints
- `GET /api/billing/invoices` - Get all invoices
- `POST /api/billing/invoices` - Create invoice
- `POST /api/billing/qr-scan` - Scan QR code
- `GET /api/billing/invoices/[id]/pdf` - Download PDF

### Payment Endpoints
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment

### Report Endpoints
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/stock` - Stock reports

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Data
The seed script creates sample data for testing:
- 2 sample branches
- 2 users (admin and regular)
- 8 sample products
- Various categories and brands

## 🔒 Security

### Authentication
- JWT tokens with expiration
- Secure password hashing with bcrypt
- Session management with HTTP-only cookies

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Audit Logging
- User activity tracking
- IP address logging
- Device information
- Timestamp recording

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**Database Connection Issues:**
- Check MongoDB Atlas connection string
- Ensure IP whitelist includes your IP
- Verify database user permissions

**Authentication Issues:**
- Check JWT_SECRET is set
- Verify cookie settings
- Clear browser cookies

**Voice Recognition Not Working:**
- Ensure HTTPS in production
- Check browser permissions
- Use supported browsers (Chrome, Edge)

### Getting Help

- Check the documentation
- Search existing issues
- Create a new issue with details
- Contact support

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced AI insights
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] Integration with accounting software
- [ ] Barcode scanning
- [ ] Inventory forecasting
- [ ] Supplier management

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added voice commands and QR codes
- **v1.2.0** - Enhanced reporting and analytics
- **v1.3.0** - AI insights and notifications

---

**Built with ❤️ for modern businesses**

For more information, visit our [documentation](https://docs.inventorypro.com) or contact us at support@inventorypro.com

