import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/lib/models/Contact'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
  const total = await Contact.countDocuments({})
  const newCount = await Contact.countDocuments({ status: 'new' })
    return NextResponse.json({ success: true, data: { total, new: newCount } })
  } catch (error) {
    console.error('Error fetching contact message stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
