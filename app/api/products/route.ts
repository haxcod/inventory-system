import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Branch from '@/models/Branch';
import { getCurrentUser } from '@/lib/auth';
import { ApiResponse, PaginationParams } from '@/types';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const branch = searchParams.get('branch') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = { isActive: true };
    
    // Filter by branch if user is not admin
    if (currentUser.role !== 'admin' && currentUser.branch) {
      query.branch = currentUser.branch;
    } else if (branch) {
      query.branch = branch;
    }

    // Add search filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const products = await Product.find(query)
      .populate('branch', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get products error:', error);
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
    if (!currentUser.permissions.includes('products.create') && currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const productData = await request.json();
    
    // Set branch for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch) {
      productData.branch = currentUser.branch;
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      const categoryPrefix = productData.category.substring(0, 3).toUpperCase();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      productData.sku = `${categoryPrefix}-${randomSuffix}`;
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Product with this SKU already exists',
      }, { status: 409 });
    }

    const product = new Product(productData);
    await product.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
      message: 'Product created successfully',
    });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

