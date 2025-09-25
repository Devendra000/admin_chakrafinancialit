import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import Blog from '@/lib/models/Blog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get counts
    const servicesCount = await Service.countDocuments();
    const blogsCount = await Blog.countDocuments();
    
    // Count blogs with status: "published"
    const publishedBlogsCount = await Blog.countDocuments({ status: "published" });
    
    // Get recent published blogs using status field
    const recentBlogs = await Blog
      .find({ 
        status: "published",
        title: { $exists: true, $nin: [null, ''] }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt _id status')
      .lean();

    // Remove any potential duplicates based on title
    const uniqueRecentBlogs = recentBlogs.reduce((acc: any[], current: any) => {
      const isDuplicate = acc.some(blog => blog.title === current.title);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []).slice(0, 3);

    // Calculate trends with proper historical context
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    // Get services created in different periods
    const servicesThisMonth = await Service.countDocuments({ 
      createdAt: { $gte: thisMonth } 
    });
    
    const servicesLastMonth = await Service.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: thisMonth } 
    });
    
    // Get published blogs created in different periods
    const blogsThisMonth = await Blog.countDocuments({ 
      createdAt: { $gte: thisMonth },
      status: "published"
    });
    
    const blogsLastMonth = await Blog.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: thisMonth },
      status: "published"
    });
    
    // Check if we have enough historical data (at least 2 months)
    const hasHistoricalData = await Blog.countDocuments({ 
      createdAt: { $lt: thisMonth },
      status: "published"
    }) > 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalServices: servicesCount || 0,
          totalBlogs: blogsCount || 0,
          publishedBlogs: publishedBlogsCount || 0,
          servicesThisMonth: servicesThisMonth || 0,
          servicesLastMonth: servicesLastMonth || 0,
          blogsThisMonth: blogsThisMonth || 0,
          blogsLastMonth: blogsLastMonth || 0,
          hasHistoricalData: hasHistoricalData
        },
        recentBlogs: uniqueRecentBlogs || [],
        meta: {
          lastUpdated: new Date().toISOString(),
          hasData: (servicesCount + blogsCount) > 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}