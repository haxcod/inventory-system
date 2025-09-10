import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Branch from '@/models/Branch';
import { getCurrentUser } from '@/lib/auth';
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

    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Branch not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: branch,
    });

  } catch (error) {
    console.error('Get branch error:', error);
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

    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Branch not found',
      }, { status: 404 });
    }

    const updateData = await request.json();
    const updatedBranch = await Branch.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedBranch,
      message: 'Branch updated successfully',
    });

  } catch (error) {
    console.error('Update branch error:', error);
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

    const branch = await Branch.findById(params.id);
    if (!branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Branch not found',
      }, { status: 404 });
    }

    // Soft delete
    await Branch.findByIdAndUpdate(params.id, { isActive: false });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Branch deleted successfully',
    });

  } catch (error) {
    console.error('Delete branch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

