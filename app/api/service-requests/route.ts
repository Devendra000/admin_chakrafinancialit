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

    const query: any = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } },
        { packageType: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

  const items = await ServiceInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
  const total = await ServiceInquiry.countDocuments(query)

    return NextResponse.json({ success: true, data: { items, pagination: { currentPage: page, total, totalPages: Math.ceil(total / limit) } } })
  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
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
