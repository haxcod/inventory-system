import mongoose, { Schema, Document } from 'mongoose';
import { AuditLog as IAuditLog } from '@/types';

export interface AuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const AuditLogSchema = new Schema<AuditLogDocument>({
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  resource: {
    type: String,
    required: true,
    trim: true,
  },
  resourceId: {
    type: String,
    required: true,
    trim: true,
  },
  changes: {
    type: Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true,
  },
  userAgent: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ resource: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.models.AuditLog || mongoose.model<AuditLogDocument>('AuditLog', AuditLogSchema);
