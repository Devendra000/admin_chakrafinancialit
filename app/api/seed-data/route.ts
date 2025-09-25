import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import Blog from '@/lib/models/Blog';

export async function POST() {
  try {
    await connectDB();
    
    // Sample services data
    const sampleServices = [
      {
        title: "Investment Planning",
        description: "Comprehensive investment planning services to help you build and grow your portfolio with expert guidance and personalized strategies.",
        shortDescription: "Professional investment advisory services",
        category: "Investment",
        tags: ["investment", "portfolio", "planning"],
        highlights: [
          "Portfolio diversification strategy",
          "Risk assessment and management", 
          "Regular performance reviews",
          "Tax-efficient investing"
        ],
        packages: {
          Basic: { 
            price: "$299/month", 
            features: ["Basic consultation", "Monthly portfolio review", "Email support"], 
            recommended: false 
          },
          Standard: { 
            price: "$599/month", 
            features: ["Regular meetings", "Quarterly portfolio review", "Phone & email support", "Investment research"], 
            recommended: true 
          },
          Premium: { 
            price: "$999/month", 
            features: ["24/7 support", "Personal advisor", "Weekly reviews", "Custom strategies"], 
            recommended: false 
          }
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        title: "Tax Planning & Advisory",
        description: "Strategic tax planning services to minimize your tax liability while maximizing your financial growth opportunities.",
        shortDescription: "Expert tax planning and advisory services",
        category: "Tax",
        tags: ["tax", "planning", "advisory"],
        highlights: [
          "Tax-loss harvesting strategies",
          "Retirement account optimization",
          "Business tax planning",
          "Estate tax planning"
        ],
        packages: {
          Basic: { 
            price: "$199/month", 
            features: ["Basic tax consultation", "Annual tax review"], 
            recommended: false 
          },
          Standard: { 
            price: "$399/month", 
            features: ["Quarterly tax planning", "Tax-loss harvesting", "Professional support"], 
            recommended: true 
          },
          Premium: { 
            price: "$699/month", 
            features: ["Monthly tax optimization", "Estate planning", "Business tax strategies"], 
            recommended: false 
          }
        },
        isActive: true,
        createdAt: new Date()
      },
      {
        title: "Retirement Planning",
        description: "Secure your future with our comprehensive retirement planning services designed to ensure financial security in your golden years.",
        shortDescription: "Complete retirement planning solutions",
        category: "Retirement",
        tags: ["retirement", "planning", "future"],
        highlights: [
          "401(k) optimization strategies",
          "IRA and Roth IRA planning",
          "Social Security maximization",
          "Healthcare cost planning"
        ],
        packages: {
          Basic: { 
            price: "$249/month", 
            features: ["Retirement goal assessment", "Basic planning"], 
            recommended: false 
          },
          Standard: { 
            price: "$499/month", 
            features: ["Comprehensive planning", "Regular reviews", "Tax optimization"], 
            recommended: true 
          },
          Premium: { 
            price: "$799/month", 
            features: ["Advanced strategies", "Estate planning", "Legacy planning"], 
            recommended: false 
          }
        },
        isActive: true,
        createdAt: new Date()
      }
    ];

    // Sample blogs data
    const sampleBlogs = [
      {
        title: "10 Essential Investment Strategies for 2024",
        excerpt: "Discover the most effective investment strategies to build wealth and secure your financial future in the current market environment.",
        content: "Investment strategies have evolved significantly over the years. Here are the top 10 strategies every investor should consider: 1. Diversification across asset classes, 2. Dollar-cost averaging for consistent investing...",
        author: {
          name: "Sarah Johnson",
          avatar: "/placeholder-user.jpg"
        },
        category: "Investment",
        tags: ["investment", "strategy", "wealth", "portfolio"],
        featuredImage: "/placeholder.jpg",
        isPublished: true,
        isFeatured: true,
        seo: {
          metaTitle: "10 Essential Investment Strategies for 2024 | Chakra Financial",
          metaDescription: "Learn the most effective investment strategies to build wealth and secure your financial future. Expert tips and insights.",
          keywords: ["investment strategies", "wealth building", "portfolio management", "financial planning"],
          canonicalUrl: "https://chakrafinancial.com/blog/investment-strategies-2024"
        },
        readTime: 8,
        slug: "10-essential-investment-strategies-2024",
        createdAt: new Date()
      },
      {
        title: "Tax Planning Tips for Small Business Owners",
        excerpt: "Essential tax strategies every small business owner should know to maximize deductions and minimize tax liability.",
        content: "Small business tax planning requires careful consideration of multiple factors. Here are key strategies: business structure optimization, expense deductions, retirement planning...",
        author: {
          name: "Michael Chen",
          avatar: "/placeholder-user.jpg"
        },
        category: "Tax",
        tags: ["tax", "business", "planning", "deductions"],
        featuredImage: "/placeholder.jpg",
        isPublished: true,
        isFeatured: false,
        seo: {
          metaTitle: "Tax Planning Tips for Small Business Owners | Expert Advice",
          metaDescription: "Learn essential tax strategies for small business owners. Maximize deductions and minimize tax liability with expert tips.",
          keywords: ["tax planning", "small business", "tax deductions", "business tax"],
          canonicalUrl: "https://chakrafinancial.com/blog/small-business-tax-planning"
        },
        readTime: 6,
        slug: "tax-planning-tips-small-business-owners",
        createdAt: new Date()
      },
      {
        title: "Building Your Emergency Fund: A Complete Guide",
        excerpt: "Learn how to build and maintain an emergency fund that will protect you from financial uncertainties and unexpected expenses.",
        content: "An emergency fund is your financial safety net. Here's how to build one: determine your target amount (3-6 months of expenses), choose the right savings account, automate your savings...",
        author: {
          name: "Emily Rodriguez",
          avatar: "/placeholder-user.jpg"
        },
        category: "Savings",
        tags: ["emergency fund", "savings", "financial security", "budgeting"],
        featuredImage: "/placeholder.jpg",
        isPublished: true,
        isFeatured: false,
        seo: {
          metaTitle: "Emergency Fund Guide: How to Build Financial Security",
          metaDescription: "Complete guide to building an emergency fund. Learn the steps to create financial security and protect against unexpected expenses.",
          keywords: ["emergency fund", "savings guide", "financial security", "emergency savings"],
          canonicalUrl: "https://chakrafinancial.com/blog/emergency-fund-guide"
        },
        readTime: 5,
        slug: "building-emergency-fund-complete-guide",
        createdAt: new Date()
      }
    ];

    // Insert sample data using Mongoose models
    // Clear existing data first (optional)
    await Service.deleteMany({});
    await Blog.deleteMany({});

    // Insert new sample data
    await Service.insertMany(sampleServices);
    await Blog.insertMany(sampleBlogs);

    return NextResponse.json({
      success: true,
      message: 'Sample data inserted successfully',
      data: {
        servicesInserted: sampleServices.length,
        blogsInserted: sampleBlogs.length
      }
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed sample data'
    }, { status: 500 });
  }
}