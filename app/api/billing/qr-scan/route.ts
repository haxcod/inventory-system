import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/auth';
import { parseQRCodeData, validateProductQRData } from '@/utils/qrcode';
import { ApiResponse } from '@/types';

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

    const { qrData } = await request.json();

    if (!qrData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'QR code data is required',
      }, { status: 400 });
    }

    // Parse QR code data
    const parsedData = parseQRCodeData(qrData);
    if (!parsedData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid QR code format',
      }, { status: 400 });
    }

    // Validate product QR data
    if (!validateProductQRData(parsedData)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid product QR code',
      }, { status: 400 });
    }

    // Find product by ID or SKU
    const product = await Product.findOne({
      $or: [
        { _id: parsedData.id },
        { sku: parsedData.sku },
      ],
      isActive: true,
    }).populate('branch', 'name');

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
        message: 'Product not available in your branch',
      }, { status: 403 });
    }

    // Check stock availability
    if (product.stock <= 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Product is out of stock',
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          unit: product.unit,
          category: product.category,
          branch: product.branch,
        },
      },
      message: 'Product found successfully',
    });

  } catch (error) {
    console.error('QR scan error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

