export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  permissions: string[];
  branch?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  category: string;
  brand?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  branch: string;
  batchNumber?: string;
  warranty?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  branch: string;
  createdBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  product: string | Product;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface Payment {
  _id: string;
  invoice?: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  paymentType: 'credit' | 'debit';
  description: string;
  reference?: string;
  customer?: string;
  branch: string;
  createdBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  _id: string;
  product: string;
  branch: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  reason: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface Report {
  _id: string;
  type: 'sales' | 'purchase' | 'stock' | 'profit_loss';
  period: 'daily' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  data: any;
  branch?: string;
  createdBy: string;
  createdAt: Date;
}

export interface AuditLog {
  _id: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface DashboardWidget {
  _id: string;
  user: string;
  widgetType: string;
  position: { x: number; y: number; w: number; h: number };
  config: any;
  isVisible: boolean;
}

export interface VoiceCommand {
  command: string;
  action: string;
  parameters?: any;
}

export interface AIInsight {
  _id: string;
  type: 'demand_prediction' | 'reorder_suggestion' | 'anomaly_detection' | 'upsell_recommendation';
  product?: string;
  branch?: string;
  data: any;
  confidence: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
