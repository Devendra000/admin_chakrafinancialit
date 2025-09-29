import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ServiceInquiry from '@/lib/models/ServiceInquiry'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
  const total = await ServiceInquiry.countDocuments({})
  const newCount = await ServiceInquiry.countDocuments({ status: 'new' })
    return NextResponse.json({ success: true, data: { total, new: newCount } })
  } catch (error) {
    console.error('Error fetching service request stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
