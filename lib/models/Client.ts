import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services: string[]; // Services they're interested in or using
  status: 'lead' | 'active' | 'inactive' | 'converted';
  source: string; // How they found us
  assignedTo?: string; // Staff member assigned
  notes?: string;
  contactDate: Date;
  lastContact?: Date;
  nextFollowUp?: Date;
  value?: number; // Potential or actual value
  isTestData?: boolean; // Track if this is test data or real client
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  services: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['lead', 'active', 'inactive', 'converted'],
    default: 'lead',
    required: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [50, 'Source cannot exceed 50 characters']
  },
  assignedTo: {
    type: String,
    trim: true,
    maxlength: [50, 'Assigned person cannot exceed 50 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  contactDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastContact: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  },
  value: {
    type: Number,
    min: [0, 'Value cannot be negative'],
    default: 0
  },
  isTestData: {
    type: Boolean,
    default: false
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Zip code cannot exceed 10 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'USA'
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ClientSchema.index({ email: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ assignedTo: 1 });
ClientSchema.index({ contactDate: -1 });
ClientSchema.index({ nextFollowUp: 1 });
ClientSchema.index({ 'services': 1 });
ClientSchema.index({ isTestData: 1 });

// Virtual for full address
ClientSchema.virtual('fullAddress').get(function(this: IClient) {
  if (!this.address) return '';
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for days since last contact
ClientSchema.virtual('daysSinceLastContact').get(function(this: IClient) {
  if (!this.lastContact) return null;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.lastContact.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for follow-up status
ClientSchema.virtual('followUpStatus').get(function(this: IClient) {
  if (!this.nextFollowUp) return 'none';
  
  const now = new Date();
  const followUpDate = new Date(this.nextFollowUp);
  
  if (followUpDate < now) return 'overdue';
  
  const diffTime = followUpDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'today';
  if (diffDays <= 7) return 'this-week';
  return 'future';
});

// Pre-save middleware to set lastContact if not provided
ClientSchema.pre('save', function(next) {
  if (this.isNew && !this.lastContact) {
    this.lastContact = this.contactDate;
  }
  next();
});

const Client = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;