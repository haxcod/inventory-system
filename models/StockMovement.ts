import mongoose, { Schema, Document } from 'mongoose';
import { StockMovement as IStockMovement } from '@/types';

export interface StockMovementDocument extends Omit<IStockMovement, '_id'>, Document {}

const StockMovementSchema = new Schema<StockMovementDocument>({
  product: {
    type: String,
    ref: 'Product',
    required: true,
  },
  branch: {
    type: String,
    ref: 'Branch',
    required: true,
  },
  type: {
    type: String,
    enum: ['in', 'out', 'transfer'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
StockMovementSchema.index({ product: 1 });
StockMovementSchema.index({ branch: 1 });
StockMovementSchema.index({ type: 1 });
StockMovementSchema.index({ createdBy: 1 });
StockMovementSchema.index({ createdAt: -1 });

export default mongoose.models.StockMovement || mongoose.model<StockMovementDocument>('StockMovement', StockMovementSchema);
