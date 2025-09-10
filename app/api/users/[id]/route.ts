import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    // Check permissions
    if (currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const user = await User.findById(params.id)
      .select('-password')
      .populate('branch', 'name');

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    // Check permissions
    if (currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    const updateData = await request.json();
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    } else {
      delete updateData.password; // Remove password from update if not provided
    }

    // Ensure email is lowercase
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('branch', 'name');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Not authenticated',
      }, { status: 401 });
    }

    // Check permissions
    if (currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found',
      }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === currentUser.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Cannot delete your own account',
      }, { status: 400 });
    }

    // Soft delete
    await User.findByIdAndUpdate(params.id, { isActive: false });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

