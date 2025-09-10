import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';
import StockMovement from '@/models/StockMovement';
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const branch = searchParams.get('branch') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build query
    const query: any = {};
    
    // Filter by branch if user is not admin
    if (currentUser.role !== 'admin' && currentUser.branch) {
      query.branch = currentUser.branch;
    } else if (branch) {
      query.branch = branch;
    }

    // Add search filters
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.paymentStatus = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Execute query
    const invoices = await Invoice.find(query)
      .populate('items.product', 'name sku price')
      .populate('branch', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get invoices error:', error);
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
    if (!currentUser.permissions.includes('billing.create') && currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const invoiceData = await request.json();
    
    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;
    
    // Set branch for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch) {
      invoiceData.branch = currentUser.branch;
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of invoiceData.items) {
      item.total = item.quantity * item.price;
      if (item.discount) {
        item.total -= item.discount;
      }
      subtotal += item.total;
    }

    const tax = invoiceData.tax || 0;
    const discount = invoiceData.discount || 0;
    const total = subtotal + tax - discount;

    // Create invoice
    const invoice = new Invoice({
      ...invoiceData,
      invoiceNumber,
      subtotal,
      tax,
      discount,
      total,
      createdBy: currentUser.userId,
    });

    await invoice.save();

    // Update stock for each item
    for (const item of invoice.items) {
      const product = await Product.findById(item.product);
      if (product) {
        // Check if sufficient stock
        if (product.stock < item.quantity) {
          return NextResponse.json<ApiResponse>({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          }, { status: 400 });
        }

        // Update stock
        product.stock -= item.quantity;
        await product.save();

        // Create stock movement record
        const stockMovement = new StockMovement({
          product: item.product,
          branch: invoice.branch,
          type: 'out',
          quantity: item.quantity,
          reason: 'Sale',
          reference: invoice.invoiceNumber,
          createdBy: currentUser.userId,
        });
        await stockMovement.save();
      }
    }

    // Populate the created invoice
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('items.product', 'name sku price')
      .populate('branch', 'name')
      .populate('createdBy', 'name email');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: populatedInvoice,
      message: 'Invoice created successfully',
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

