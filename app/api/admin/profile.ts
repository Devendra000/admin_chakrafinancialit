import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/app/models/Admin';
import AdminActivityLog from '@/app/models/AdminActivityLog';



export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { adminId, name, password, currentPassword } = await request.json();
    if (!adminId) {
      return NextResponse.json({ success: false, error: 'Admin ID is required.' }, { status: 400 });
    }
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found.' }, { status: 404 });
    }
    // If changing password, verify current password
    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required.' }, { status: 400 });
      }
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
      }
      admin.password = password;
    }
    if (name) {
      admin.name = name;
    }
    await admin.save();
    // Log activity
    await AdminActivityLog.create({
      adminId: admin._id,
      action: 'Update Profile',
      details: name ? 'Admin updated profile info' : 'Admin changed password',
      ipAddress: request.headers.get('x-forwarded-for') || '',
    });
    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile.' }, { status: 500 });
  }
}
