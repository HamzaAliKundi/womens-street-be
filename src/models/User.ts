import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  status: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);