import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Branch from '@/models/Branch';
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
    const branch = searchParams.get('branch');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';

    // Build query
    const query: any = { isActive: true };
    
    // Filter by branch
    if (currentUser.role !== 'admin' && currentUser.branch) {
      query.branch = currentUser.branch;
    } else if (branch) {
      query.branch = branch;
    }

    if (category) {
      query.category = category;
    }

    if (lowStock) {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    }

    // Get stock summary
    const stockSummary = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalCostValue: { $sum: { $multiply: ['$stock', '$costPrice'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minStock'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$stock', 0] }, 1, 0]
            }
          },
        }
      }
    ]);

    // Get products with stock details
    const products = await Product.find(query)
      .populate('branch', 'name')
      .sort({ stock: 1 })
      .limit(100);

    // Get stock movements for recent activity
    const recentMovements = await StockMovement.find({
      ...(currentUser.role !== 'admin' && currentUser.branch ? { branch: currentUser.branch } : branch ? { branch } : {}),
    })
      .populate('product', 'name sku')
      .populate('branch', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get category-wise stock
    const categoryStock = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minStock'] }, 1, 0]
            }
          },
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Get fast-moving products (based on recent stock movements)
    const fastMovingProducts = await StockMovement.aggregate([
      {
        $match: {
          type: 'out',
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          },
          ...(currentUser.role !== 'admin' && currentUser.branch ? { branch: currentUser.branch } : branch ? { branch } : {}),
        }
      },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          movementCount: { $sum: 1 },
        }
      },
      { $sort: { totalQuantity: -1 } },
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
          currentStock: '$product.stock',
          totalQuantity: 1,
          movementCount: 1,
        }
      }
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        summary: stockSummary[0] || {
          totalProducts: 0,
          totalStockValue: 0,
          totalCostValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0,
        },
        products,
        recentMovements,
        categoryStock,
        fastMovingProducts,
      },
    });

  } catch (error) {
    console.error('Get stock report error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

