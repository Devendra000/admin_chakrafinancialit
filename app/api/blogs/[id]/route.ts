import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import Subscriber from '@/lib/models/Subscriber';
import EmailService from '@/lib/emailService';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog
    });

  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blog ID' },
        { status: 400 }
      );
    }
    const body = await request.json();
    // Update slug if title changed
    if (body.title && !body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    // Get current blog to check status change
    const currentBlog: any = await Blog.findById(id).lean();
    if (!currentBlog || Array.isArray(currentBlog)) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    const wasPublished = currentBlog.status === 'published';
    const willBePublished = body.status === 'published';
    const isStatusChangingToPublished = !wasPublished && willBePublished;
    const updatedBlog: any = await Blog.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    ).lean();
    if (!updatedBlog || Array.isArray(updatedBlog)) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    // Email notification if status changed to published
    let emailNotification = null;
    if (isStatusChangingToPublished) {
      try {
        const subscribers = await Subscriber.find({}).select('email').lean();
        const subscriberEmails = subscribers.map((s: any) => s.email);
        if (subscriberEmails.length > 0) {
          const emailService = new EmailService();
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://www.chakrafinancialit.me';
          const blogUrl = `${baseUrl}/blog/${updatedBlog.slug}`;
          // Convert relative image path to absolute URL for email
          const getAbsoluteImageUrl = (imagePath: string) => {
            if (!imagePath) return '';
            if (imagePath.startsWith('http')) return imagePath;
            const cleanPath = imagePath.startsWith('/') ? imagePath : `${baseUrl}/${imagePath}`;
            return `${baseUrl}${cleanPath}`;
          };
          const blogEmailData = {
            title: updatedBlog.title,
            excerpt: updatedBlog.excerpt,
            author: updatedBlog.author,
            category: updatedBlog.category,
            publishedAt: new Date(updatedBlog.publishedAt || updatedBlog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            blogUrl,
            featuredImage: getAbsoluteImageUrl(updatedBlog.featuredImage || ''),
            tags: updatedBlog.tags || []
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
      data: updatedBlog,
      emailNotification
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid blog ID' },
        { status: 400 }
      );
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
