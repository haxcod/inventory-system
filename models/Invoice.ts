import mongoose, { Schema, Document } from 'mongoose';
import { Invoice as IInvoice, InvoiceItem } from '@/types';

export interface InvoiceDocument extends Omit<IInvoice, '_id'>, Document {}

const InvoiceItemSchema = new Schema<InvoiceItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const InvoiceSchema = new Schema<InvoiceDocument>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  items: [InvoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending',
  },
  branch: {
    type: String,
    ref: 'Branch',
    required: true,
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ branch: 1 });
InvoiceSchema.index({ createdBy: 1 });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ 'customer.name': 'text', 'customer.email': 'text' });

export default mongoose.models.Invoice || mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
