// This endpoint is now obsolete. Use /api/admin instead for GET profile.

// The file is being removed as it is no longer needed.
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/app/models/Admin';
import AdminActivityLog from '@/app/models/AdminActivityLog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // For demo: get the first admin (in production, use session/auth)
    const admin = await Admin.findOne({});
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
    }
    // Log activity
    await AdminActivityLog.create({
      adminId: admin._id,
      action: 'View Profile',
      details: 'Admin viewed their profile',
  ipAddress: request.headers.get('x-forwarded-for') || '',
    });
    return NextResponse.json({
      success: true,
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        department: admin.department,
        location: admin.location,
        bio: admin.bio,
        avatar: admin.avatar,
        joinedAt: admin.joinedAt,
        lastLogin: admin.lastLogin,
        status: admin.status,
      }
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile.' }, { status: 500 });
  }
}
