import mongoose, { Schema, Document } from 'mongoose';
import { Branch as IBranch } from '@/types';

export interface BranchDocument extends Omit<IBranch, '_id'>, Document {}

const BranchSchema = new Schema<BranchDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  manager: {
    type: String,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
BranchSchema.index({ name: 1 });
BranchSchema.index({ isActive: 1 });

export default mongoose.models.Branch || mongoose.model<BranchDocument>('Branch', BranchSchema);
