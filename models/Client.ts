import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Prospect';
  joinDate: Date;
  totalValue: string;
  services: string[];
  lastContact: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Prospect'],
    default: 'Prospect',
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  totalValue: {
    type: String,
    default: '$0',
  },
  services: [{
    type: String,
  }],
  lastContact: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: '/admin-avatar.png',
  },
}, {
  timestamps: true,
});

// Prevent recompilation error
const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;