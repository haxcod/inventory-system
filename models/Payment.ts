import mongoose, { Schema, Document } from 'mongoose';
import { Payment as IPayment } from '@/types';

export interface PaymentDocument extends Omit<IPayment, '_id'>, Document {}

const PaymentSchema = new Schema<PaymentDocument>({
  invoice: {
    type: String,
    ref: 'Invoice',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer'],
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  customer: {
    type: String,
    trim: true,
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
PaymentSchema.index({ invoice: 1 });
PaymentSchema.index({ branch: 1 });
PaymentSchema.index({ createdBy: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ customer: 1 });

export default mongoose.models.Payment || mongoose.model<PaymentDocument>('Payment', PaymentSchema);
