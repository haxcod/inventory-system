import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    const user = await User.findById(currentUser.userId);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    // Verify current password if changing password
    if (newPassword && currentPassword) {
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Current password is incorrect',
        }, { status: 400 });
      }

      // Hash new password
      user.password = await hashPassword(newPassword);
    }

    // Update user data
    user.name = name;
    user.email = email.toLowerCase();

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

