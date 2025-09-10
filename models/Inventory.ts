import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  lastUpdated: Date;
  lastRestocked: Date;
  cost: number;
  sellingPrice: number;
  supplier: string;
  location: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  branchId: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    required: true,
    default: 1000,
    min: 0
  },
  reorderPoint: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'inventory'
});

// Indexes for better query performance
InventorySchema.index({ productId: 1, branchId: 1 }, { unique: true });
InventorySchema.index({ branchId: 1, isActive: 1 });
InventorySchema.index({ quantity: 1 });
InventorySchema.index({ reorderPoint: 1 });

// Virtual for available quantity calculation
InventorySchema.virtual('calculatedAvailableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Pre-save middleware to update available quantity
InventorySchema.pre('save', function(next) {
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  this.lastUpdated = new Date();
  next();
});

// Static method to find low stock items
InventorySchema.statics.findLowStock = function(branchId?: string) {
  const query: any = { isActive: true };
  if (branchId) {
    query.branchId = branchId;
  }
  return this.find({
    ...query,
    $expr: { $lte: ['$quantity', '$reorderPoint'] }
  });
};

// Static method to find out of stock items
InventorySchema.statics.findOutOfStock = function(branchId?: string) {
  const query: any = { isActive: true };
  if (branchId) {
    query.branchId = branchId;
  }
  return this.find({
    ...query,
    quantity: 0
  });
};

// Instance method to check if reorder is needed
InventorySchema.methods.needsReorder = function() {
  return this.quantity <= this.reorderPoint;
};

// Instance method to reserve stock
InventorySchema.methods.reserveStock = function(amount: number) {
  if (this.availableQuantity >= amount) {
    this.reservedQuantity += amount;
    this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
    return true;
  }
  return false;
};

// Instance method to release reserved stock
InventorySchema.methods.releaseReservedStock = function(amount: number) {
  this.reservedQuantity = Math.max(0, this.reservedQuantity - amount);
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
};

// Instance method to adjust stock
InventorySchema.methods.adjustStock = function(amount: number, reason: string) {
  this.quantity = Math.max(0, this.quantity + amount);
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  this.lastUpdated = new Date();
  
  if (amount > 0) {
    this.lastRestocked = new Date();
  }
};

const Inventory = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
