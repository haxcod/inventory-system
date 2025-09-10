import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('branch', 'name')
      .sort({ name: 1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { users },
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const userData = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User already exists with this email',
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = new User({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      isActive: true,
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: userResponse,
      message: 'User created successfully',
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

