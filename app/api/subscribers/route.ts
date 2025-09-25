import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber from '@/lib/models/Subscriber';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    const subscribers = await Subscriber
      .find(query)
      .limit(limit)
      .sort({ subscribedAt: -1 })
      .lean();

    // Get unique sources for filtering
    const sources = await Subscriber.distinct('source');

    return NextResponse.json({
      success: true,
      data: {
        subscribers: subscribers,
        sources: sources
      }
    });

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const newSubscriber = await Subscriber.create(body);

    return NextResponse.json({
      success: true,
      data: newSubscriber
    });

  } catch (error) {
    console.error('Error creating subscriber:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create subscriber' },
      { status: 500 }
    );
  }
}