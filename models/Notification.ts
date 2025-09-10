import mongoose, { Schema, Document } from 'mongoose';
import { Notification as INotification } from '@/types';

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const NotificationSchema = new Schema<NotificationDocument>({
  user: {
    type: String,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  actionUrl: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
NotificationSchema.index({ user: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema);
