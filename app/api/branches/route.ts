import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Branch from '@/models/Branch';
import { getCurrentUser } from '@/lib/auth';
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
    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const branches = await Branch.find(query).sort({ name: 1 });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { branches },
    });

  } catch (error) {
    console.error('Get branches error:', error);
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

    const branchData = await request.json();
    
    const branch = new Branch(branchData);
    await branch.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: branch,
      message: 'Branch created successfully',
    });

  } catch (error) {
    console.error('Create branch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

