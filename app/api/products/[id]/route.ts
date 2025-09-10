import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const product = await Product.findById(id).populate('branch', 'name');
    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Product not found',
      }, { status: 404 });
    }

    // Check branch access for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch && product.branch !== currentUser.branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    if (!currentUser.permissions.includes('products.update') && currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Product not found',
      }, { status: 404 });
    }

    // Check branch access for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch && product.branch !== currentUser.branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const updateData = await request.json();
    
    // Prevent branch change for non-admin users
    if (currentUser.role !== 'admin' && updateData.branch) {
      delete updateData.branch;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('branch', 'name');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    if (!currentUser.permissions.includes('products.delete') && currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Product not found',
      }, { status: 404 });
    }

    // Check branch access for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch && product.branch !== currentUser.branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    // Soft delete
    await Product.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

