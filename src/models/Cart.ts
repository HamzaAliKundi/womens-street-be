import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface ICart extends Document {
  guestId: string; // Unique ID for anonymous users
  items: ICartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const CartSchema: Schema = new Schema({
  guestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalItems: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
CartSchema.pre('save', function(next) {
    // @ts-ignore
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    // @ts-ignore
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  next();
});

// Index for better performance
CartSchema.index({ guestId: 1 });
CartSchema.index({ createdAt: 1 });

export default mongoose.model<ICart>('Cart', CartSchema);
