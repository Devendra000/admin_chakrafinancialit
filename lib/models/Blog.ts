import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonicalUrl: String,
    focusKeyword: String,
    openGraph: {
      title: String,
      description: String,
      image: String,
      imageAlt: String
    },
    twitter: {
      title: String,
      description: String,
      image: String,
      imageAlt: String
    },
    noIndex: {
      type: Boolean,
      default: false
    },
    noFollow: {
      type: Boolean,
      default: false
    }
  },
  publishedAt: {
    type: Date
  },
  readTime: {
    type: Number,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);