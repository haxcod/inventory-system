'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  sales: any;
  stock: any;
  isLoading: boolean;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    sales: null,
    stock: null,
    isLoading: true,
  });
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedReport, setSelectedReport] = useState('sales');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod, selectedReport]);

  const fetchReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, isLoading: true }));
      
      const [salesResponse, stockResponse] = await Promise.all([
        fetch(`/api/reports/sales?period=${selectedPeriod}`),
        fetch('/api/reports/stock')
      ]);

      const [salesData, stockData] = await Promise.all([
        salesResponse.json(),
        stockResponse.json()
      ]);

      setReportData({
        sales: salesData.success ? salesData.data : null,
        stock: stockData.success ? stockData.data : null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleExport = (type: 'pdf' | 'csv') => {
    // Implement export functionality
    console.log(`Exporting ${type} for ${selectedReport} report`);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (reportData.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive business insights and analytics
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="input"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="input"
                >
                  <option value="sales">Sales Report</option>
                  <option value="stock">Stock Report</option>
                  <option value="profit">Profit & Loss</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Report */}
        {selectedReport === 'sales' && reportData.sales && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(reportData.sales.summary?.totalSales || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(reportData.sales.summary?.totalInvoices || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(reportData.sales.summary?.averageOrderValue || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tax</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(reportData.sales.summary?.totalTax || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>
                    Sales performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.sales.dailySales || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency(value), 'Sales']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Distribution of payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.sales.paymentMethods || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="total"
                        >
                          {(reportData.sales.paymentMethods || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>
                  Best performing products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(reportData.sales.topProducts || []).map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {product.productSku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.totalRevenue)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.totalQuantity} sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stock Report */}
        {selectedReport === 'stock' && reportData.stock && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(reportData.stock.summary?.totalProducts || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(reportData.stock.summary?.totalStockValue || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(reportData.stock.summary?.lowStockItems || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(reportData.stock.summary?.outOfStockItems || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Products by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.stock.categoryStock || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [formatNumber(value), 'Products']}
                      />
                      <Bar dataKey="totalProducts" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

