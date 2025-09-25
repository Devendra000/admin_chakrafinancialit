import mongoose from 'mongoose';

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'unsubscribed'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['Website', 'Social Media', 'Referral', 'Email Campaign', 'Other'],
    default: 'Website'
  },
  location: {
    type: String,
    default: ''
  },
  interests: [{
    type: String,
    trim: true
  }],
  engagementScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  lastEngagement: {
    type: Date,
    default: Date.now
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  emailOpens: {
    type: Number,
    default: 0
  },
  emailClicks: {
    type: Number,
    default: 0
  },
  emailsSent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
SubscriberSchema.index({ status: 1 });
SubscriberSchema.index({ source: 1 });
SubscriberSchema.index({ subscribedAt: -1 });

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);