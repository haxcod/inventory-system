import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
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
    const period = searchParams.get('period') || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const branch = searchParams.get('branch');

    // Build date range
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      const now = new Date();
      switch (period) {
        case 'daily':
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = {
            $gte: startOfDay,
            $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
          };
          break;
        case 'monthly':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          dateFilter = {
            $gte: startOfMonth,
            $lte: endOfMonth,
          };
          break;
        case 'yearly':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const endOfYear = new Date(now.getFullYear(), 11, 31);
          dateFilter = {
            $gte: startOfYear,
            $lte: endOfYear,
          };
          break;
      }
    }

    // Build query
    const query: any = {
      createdAt: dateFilter,
    };

    // Filter by branch
    if (currentUser.role !== 'admin' && currentUser.branch) {
      query.branch = currentUser.branch;
    } else if (branch) {
      query.branch = branch;
    }

    // Get sales data
    const salesData = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalSales: { $sum: '$total' },
          totalTax: { $sum: '$tax' },
          totalDiscount: { $sum: '$discount' },
          averageOrderValue: { $avg: '$total' },
        }
      }
    ]);

    // Get daily sales for chart
    const dailySales = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            }
          },
          sales: { $sum: '$total' },
          invoices: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top products
    const topProducts = await Invoice.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          productSku: '$product.sku',
          totalQuantity: 1,
          totalRevenue: 1,
        }
      }
    ]);

    // Get payment method breakdown
    const paymentMethods = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        }
      }
    ]);

    // Get customer analysis
    const customerAnalysis = await Invoice.aggregate([
      { $match: { ...query, customer: { $exists: true } } },
      {
        $group: {
          _id: '$customer.name',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        summary: salesData[0] || {
          totalInvoices: 0,
          totalSales: 0,
          totalTax: 0,
          totalDiscount: 0,
          averageOrderValue: 0,
        },
        dailySales,
        topProducts,
        paymentMethods,
        customerAnalysis,
      },
    });

  } catch (error) {
    console.error('Get sales report error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

