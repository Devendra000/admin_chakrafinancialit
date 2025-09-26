import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import Subscriber from '@/lib/models/Subscriber';
import EmailService from '@/lib/emailService';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const blogs = await Blog
      .find(query)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Get unique categories for filtering
    const categories = await Blog.distinct('category');

    return NextResponse.json({
      success: true,
      data: {
        blogs: blogs,
        categories: categories
      }
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    // Ensure featuredImage is a full public URL
    let featuredImage = body.featuredImage;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://admin.chakrafinancialit.me';
    if (featuredImage && !featuredImage.startsWith('http')) {
      const cleanPath = featuredImage.startsWith('/') ? featuredImage : `/${featuredImage}`;
      featuredImage = `${baseUrl}${cleanPath}`;
    }
    const blogData = {
      ...body,
      slug: slug,
      featuredImage: featuredImage
    };
    const newBlog = await Blog.create(blogData);

    // Email notification if published
    let emailNotification = null;
    if (blogData.status === 'published') {
      try {
        // Use the same filter as old-admin: isActive and blogNotifications preference
        const subscribers = await Subscriber.find({}).select('email').lean();
        const subscriberEmails = subscribers.map((s: any) => s.email);
        if (subscriberEmails.length > 0) {
          const emailService = new EmailService();
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const blogUrl = `${baseUrl}/blog/${newBlog.slug}`;
          // Convert relative image path to absolute URL for email
          const getAbsoluteImageUrl = (imagePath: string) => {
            if (!imagePath) return '';
            if (imagePath.startsWith('http')) return imagePath;
            const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
            return `${baseUrl}${cleanPath}`;
          };
          const blogEmailData = {
            title: newBlog.title,
            excerpt: newBlog.excerpt,
            author: newBlog.author,
            category: newBlog.category,
            publishedAt: new Date(newBlog.publishedAt || newBlog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            blogUrl,
            featuredImage: getAbsoluteImageUrl(newBlog.featuredImage || ''),
            tags: newBlog.tags || []
          };
          emailNotification = await emailService.sendBlogNotification(blogEmailData, subscriberEmails);
        } else {
          emailNotification = { success: true, sent: 0, failed: 0 };
        }
      } catch (err) {
        console.error('Error sending blog notification:', err);
        emailNotification = { success: false, sent: 0, failed: 0 };
      }
    }

    return NextResponse.json({
      success: true,
      data: newBlog,
      emailNotification
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
