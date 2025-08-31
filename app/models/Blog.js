import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  authorBio: {
    type: String,
    required: false,
    default: ''
  },
  user_uuid: {
    type: String,
    required: false,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Finance', 'Business', 'Tips', 'News', 'Other'],
    default: 'Technology'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date
  },
  // SEO Metadata fields
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60 // Optimal for Google search results
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160 // Optimal for Google search results
    },
    metaKeywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    },
    focusKeyword: {
      type: String,
      trim: true
    },
    // Open Graph metadata for social media
    openGraph: {
      title: {
        type: String,
        trim: true,
        maxlength: 95
      },
      description: {
        type: String,
        trim: true,
        maxlength: 300
      },
      image: {
        type: String
      },
      imageAlt: {
        type: String,
        trim: true
      },
      type: {
        type: String,
        default: 'article'
      }
    },
    // Twitter Card metadata
    twitter: {
      card: {
        type: String,
        enum: ['summary', 'summary_large_image', 'app', 'player'],
        default: 'summary_large_image'
      },
      title: {
        type: String,
        trim: true,
        maxlength: 70
      },
      description: {
        type: String,
        trim: true,
        maxlength: 200
      },
      image: {
        type: String
      },
      imageAlt: {
        type: String,
        trim: true
      }
    },
    // Schema.org structured data
    schema: {
      articleType: {
        type: String,
        enum: ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'],
        default: 'BlogPosting'
      },
      wordCount: {
        type: Number,
        default: 0
      },
      dateModified: {
        type: Date,
        default: Date.now
      }
    },
    // SEO settings
    noIndex: {
      type: Boolean,
      default: false
    },
    noFollow: {
      type: Boolean,
      default: false
    }
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'super-admin'],
    default: 'admin'
  },
  user_uuid: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Simple pre-save hook without nested object modifications
BlogSchema.pre('save', function(next) {
  // Generate slug from title if needed
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate read time
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

// Add indexes for SEO optimization
BlogSchema.index({ 'seo.focusKeyword': 1 });
BlogSchema.index({ 'seo.metaKeywords': 1 });
BlogSchema.index({ slug: 1, status: 1 });
BlogSchema.index({ publishedAt: -1, status: 1 });

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export default Blog;
