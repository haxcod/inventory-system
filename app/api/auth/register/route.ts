import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, name, role = 'user', permissions = [], branch } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Email, password, and name are required',
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User already exists with this email',
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      permissions,
      branch,
      isActive: true,
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      branch: user.branch,
    });

    // Set auth cookie
    setAuthCookie(token, request);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          branch: user.branch,
        },
        token,
      },
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

