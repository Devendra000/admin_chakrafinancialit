import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceInquiry from '@/lib/models/ServiceInquiry'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const packageType = searchParams.get('packageType') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const query: any = {}
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    // Status filtering
    if (status && status !== 'all') {
      query.status = status
    }

    // Package type filtering
    if (packageType && packageType !== 'all') {
      query.packageType = packageType
    }

    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const items = await ServiceInquiry.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await ServiceInquiry.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get aggregated stats for filtering
    const statusStats = await ServiceInquiry.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const packageTypeStats = await ServiceInquiry.aggregate([
      { $group: { _id: '$packageType', count: { $sum: 1 } } }
    ])

    return NextResponse.json({ 
      success: true, 
      data: { 
        items, 
        pagination: { 
          currentPage: page, 
          total, 
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        stats: {
          statusStats,
          packageTypeStats
        }
      } 
    })
  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch service requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const { name, email } = body
    if (!name || !email) return NextResponse.json({ success: false, error: 'Name and email required' }, { status: 400 })

  const doc = new ServiceInquiry(body)
  const saved = await doc.save()

    return NextResponse.json({ success: true, data: saved }, { status: 201 })
  } catch (error) {
    console.error('Error creating service request:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
