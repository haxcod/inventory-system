import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct } from '@/types';

export interface ProductDocument extends Omit<IProduct, '_id'>, Document {}

const ProductSchema = new Schema<ProductDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  minStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxStock: {
    type: Number,
    default: 1000,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    ref: 'Branch',
    required: true,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  warranty: {
    type: String,
    trim: true,
  },
  manufacturingDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
ProductSchema.index({ sku: 1 });
ProductSchema.index({ barcode: 1 });
ProductSchema.index({ qrCode: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ branch: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model<ProductDocument>('Product', ProductSchema);
