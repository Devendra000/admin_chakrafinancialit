import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import Blog from '@/lib/models/Blog';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    // Get collection stats
    const servicesCount = await Service.countDocuments();
    const blogsCount = await Blog.countDocuments();
    
    // Get sample documents
    const sampleServices = await Service.find({}).limit(3).lean();
    const sampleBlogs = await Blog.find({}).limit(3).lean();
    
    return NextResponse.json({
      success: true,
      data: {
        collections: {
          services: {
            count: servicesCount,
            samples: sampleServices
          },
          blogs: {
            count: blogsCount,
            samples: sampleBlogs
          }
        },
        database: mongoose.connection.db?.databaseName,
        connection: 'Mongoose ODM'
      }
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 });
  }
}