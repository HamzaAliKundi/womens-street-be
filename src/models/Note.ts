import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  completed: boolean;
  category: string;
  priority: string;
  date: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  date: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<INote>('Note', NoteSchema);
