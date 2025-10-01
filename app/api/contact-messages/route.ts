import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/lib/models/Contact'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const service = searchParams.get('service') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const query: any = {}
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
      ]
    }

    // Status filtering
    if (status && status !== 'all') {
      query.status = status
    }

    // Priority filtering
    if (priority && priority !== 'all') {
      query.priority = priority
    }

    // Service filtering
    if (service && service !== 'all') {
      query.service = service
    }

    const skip = (page - 1) * limit
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const items = await Contact.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Contact.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Get aggregated stats for filtering
    const statusStats = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const priorityStats = await Contact.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])

    const serviceStats = await Contact.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } }
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
          priorityStats,
          serviceStats
        }
      } 
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch contact messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const { name, email } = body
    if (!name || !email) return NextResponse.json({ success: false, error: 'Name and email required' }, { status: 400 })

  const doc = new Contact(body)
  const saved = await doc.save()

    return NextResponse.json({ success: true, data: saved }, { status: 201 })
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
