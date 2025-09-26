import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'blog_newsletter', // Track where they subscribed from
    enum: ['blog_newsletter', 'footer', 'contact_page', 'homepage']
  },
  preferences: {
    weeklyUpdates: {
      type: Boolean,
      default: true
    },
    blogNotifications: {
      type: Boolean,
      default: true
    },
    promotionalEmails: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
subscriberSchema.index({ subscribedAt: -1 });
subscriberSchema.index({ isActive: 1 });

// Prevent duplicate model compilation
export default mongoose.models.Subscriber || mongoose.model('Subscriber', subscriberSchema);
