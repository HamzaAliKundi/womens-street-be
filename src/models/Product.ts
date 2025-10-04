import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  material: string;
  dimensions: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviews: number;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  colors: [{
    type: String,
    required: true
  }],
  sizes: [{
    type: String,
    required: true
  }],
  material: {
    type: String,
    required: true,
    trim: true
  },
  dimensions: {
    type: String,
    required: true,
    trim: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Pre-save hook to automatically update inStock based on stockQuantity
ProductSchema.pre('save', function(next) {
  // @ts-ignore
  this.inStock = this.stockQuantity > 0;
  next();
});

// Pre-update hook for findOneAndUpdate operations
ProductSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate() as any;
  if (update && update.$set && typeof update.$set.stockQuantity === 'number') {
    update.$set.inStock = update.$set.stockQuantity > 0;
  } else if (update && typeof update.stockQuantity === 'number') {
    update.inStock = update.stockQuantity > 0;
  }
  next();
});

// Index for better search performance
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ stockQuantity: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
