const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable is not set. Please check your .env.local file.');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  permissions: [{ type: String }],
  branch: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Branch Schema
const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  manager: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String, unique: true, sparse: true },
  qrCode: { type: String, unique: true, sparse: true },
  category: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 1000 },
  unit: { type: String, required: true },
  branch: { type: String, required: true },
  batchNumber: { type: String },
  warranty: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
  image: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Branch = mongoose.model('Branch', BranchSchema);
const Product = mongoose.model('Product', ProductSchema);

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data');

    // Create branches
    const mainBranch = await Branch.create({
      name: 'Main Branch',
      address: '123 Main Street, City, State 12345',
      phone: '+1-555-0123',
      email: 'main@company.com',
      isActive: true,
    });

    const branch2 = await Branch.create({
      name: 'Branch 2',
      address: '456 Oak Avenue, City, State 12345',
      phone: '+1-555-0124',
      email: 'branch2@company.com',
      isActive: true,
    });

    console.log('Created branches');

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      permissions: ['*'],
      branch: mainBranch._id.toString(),
      isActive: true,
    });

    // Create regular user
    const regularUser = await User.create({
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'user',
      permissions: ['products.read', 'products.create', 'billing.create', 'reports.read'],
      branch: mainBranch._id.toString(),
      isActive: true,
    });

    console.log('Created users');

    // Create sample products
    const products = [
      {
        name: 'Laptop Computer',
        description: 'High-performance laptop for business use',
        sku: 'LAP-001',
        category: 'Electronics',
        brand: 'TechBrand',
        price: 999.99,
        costPrice: 750.00,
        stock: 25,
        minStock: 5,
        maxStock: 50,
        unit: 'pieces',
        branch: mainBranch._id.toString(),
        batchNumber: 'BATCH-001',
        warranty: '2 years',
        isActive: true,
      },
      {
        name: 'Office Chair',
        description: 'Ergonomic office chair with lumbar support',
        sku: 'CHAIR-001',
        category: 'Furniture',
        brand: 'ComfortSeat',
        price: 299.99,
        costPrice: 200.00,
        stock: 15,
        minStock: 3,
        maxStock: 30,
        unit: 'pieces',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
      {
        name: 'Wireless Mouse',
        description: 'Bluetooth wireless mouse with ergonomic design',
        sku: 'MOUSE-001',
        category: 'Electronics',
        brand: 'TechBrand',
        price: 49.99,
        costPrice: 25.00,
        stock: 100,
        minStock: 20,
        maxStock: 200,
        unit: 'pieces',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
      {
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        sku: 'LAMP-001',
        category: 'Furniture',
        brand: 'LightPro',
        price: 79.99,
        costPrice: 45.00,
        stock: 30,
        minStock: 5,
        maxStock: 60,
        unit: 'pieces',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
      {
        name: 'Notebook Set',
        description: 'Set of 5 spiral notebooks for office use',
        sku: 'NOTE-001',
        category: 'Stationery',
        brand: 'WriteWell',
        price: 19.99,
        costPrice: 10.00,
        stock: 200,
        minStock: 50,
        maxStock: 500,
        unit: 'sets',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
      {
        name: 'Coffee Maker',
        description: 'Automatic drip coffee maker for office',
        sku: 'COFFEE-001',
        category: 'Appliances',
        brand: 'BrewMaster',
        price: 149.99,
        costPrice: 90.00,
        stock: 8,
        minStock: 2,
        maxStock: 15,
        unit: 'pieces',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
      {
        name: 'Printer Paper',
        description: 'A4 white printer paper, 500 sheets per pack',
        sku: 'PAPER-001',
        category: 'Stationery',
        brand: 'PaperPro',
        price: 12.99,
        costPrice: 6.50,
        stock: 150,
        minStock: 30,
        maxStock: 300,
        unit: 'packs',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
      {
        name: 'Water Bottle',
        description: 'Insulated stainless steel water bottle',
        sku: 'BOTTLE-001',
        category: 'Accessories',
        brand: 'HydroMax',
        price: 24.99,
        costPrice: 12.00,
        stock: 75,
        minStock: 15,
        maxStock: 150,
        unit: 'pieces',
        branch: mainBranch._id.toString(),
        isActive: true,
      },
    ];

    await Product.insertMany(products);
    console.log('Created products');

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log('- 2 Branches');
    console.log('- 2 Users (admin@example.com / user@example.com)');
    console.log('- 8 Products across different categories');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('User: user@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seed
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();

