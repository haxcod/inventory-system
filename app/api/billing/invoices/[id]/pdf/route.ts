import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getCurrentUser } from '@/lib/auth';
import { generateInvoicePDFBuffer } from '@/utils/pdf';
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

    const invoice = await Invoice.findById(params.id)
      .populate('items.product', 'name sku price')
      .populate('branch', 'name address phone email')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invoice not found',
      }, { status: 404 });
    }

    // Check branch access for non-admin users
    if (currentUser.role !== 'admin' && currentUser.branch && invoice.branch !== currentUser.branch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Access denied',
      }, { status: 403 });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDFBuffer(invoice, {
      companyName: 'Inventory Management System',
      companyAddress: 'Your Company Address',
      companyPhone: '+91 1234567890',
      companyEmail: 'info@yourcompany.com',
    });

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Generate PDF error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

