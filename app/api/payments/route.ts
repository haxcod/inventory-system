import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
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
    const type = searchParams.get('type') || '';
    const customer = searchParams.get('customer') || '';
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
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { customer: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) {
      query.paymentType = type;
    }

    if (customer) {
      query.customer = { $regex: customer, $options: 'i' };
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Execute query
    const payments = await Payment.find(query)
      .populate('invoice', 'invoiceNumber customer')
      .populate('branch', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    // Calculate summary
    const summary = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: {
              $cond: [{ $eq: ['$paymentType', 'credit'] }, '$amount', 0]
            }
          },
          totalDebit: {
            $sum: {
              $cond: [{ $eq: ['$paymentType', 'debit'] }, '$amount', 0]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        payments,
        summary: summary[0] || { totalCredit: 0, totalDebit: 0, count: 0 },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get payments error:', error);
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
    if (!currentUser.permissions.includes('payments.create') && currentUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    const paymentData = await request.json();
    
    // Set branch for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch) {
      paymentData.branch = currentUser.branch;
    }

    // If linked to invoice, verify it exists and belongs to the same branch
    if (paymentData.invoice) {
      const invoice = await Invoice.findById(paymentData.invoice);
      if (!invoice) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Invoice not found',
        }, { status: 404 });
      }

      if (currentUser.role !== 'admin' && currentUser.branch && invoice.branch !== currentUser.branch) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Access denied',
        }, { status: 403 });
      }
    }

    const payment = new Payment({
      ...paymentData,
      createdBy: currentUser.userId,
    });

    await payment.save();

    // Update invoice payment status if linked
    if (paymentData.invoice) {
      const invoice = await Invoice.findById(paymentData.invoice);
      if (invoice) {
        const totalPaid = await Payment.aggregate([
          { $match: { invoice: paymentData.invoice, paymentType: 'credit' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const paidAmount = totalPaid[0]?.total || 0;
        const remainingAmount = invoice.total - paidAmount;

        if (remainingAmount <= 0) {
          invoice.paymentStatus = 'paid';
        } else if (paidAmount > 0) {
          invoice.paymentStatus = 'partial';
        } else {
          invoice.paymentStatus = 'pending';
        }

        await invoice.save();
      }
    }

    // Populate the created payment
    const populatedPayment = await Payment.findById(payment._id)
      .populate('invoice', 'invoiceNumber customer')
      .populate('branch', 'name')
      .populate('createdBy', 'name email');

    return NextResponse.json<ApiResponse>({
      success: true,
      data: populatedPayment,
      message: 'Payment recorded successfully',
    });

  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

