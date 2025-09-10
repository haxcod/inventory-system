import PDFDocument from 'pdfkit';
import { Invoice, InvoiceItem } from '@/types';

export interface InvoicePDFOptions {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  logo?: string;
  taxRate?: number;
  currency?: string;
}

export function generateInvoicePDF(
  invoice: Invoice,
  options: InvoicePDFOptions = {}
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  const {
    companyName = 'Your Company Name',
    companyAddress = 'Your Company Address',
    companyPhone = 'Your Phone Number',
    companyEmail = 'your@email.com',
    taxRate = 0.18, // 18% GST
    currency = '₹',
  } = options;

  // Header
  doc.fontSize(20).text(companyName, 50, 50);
  doc.fontSize(10).text(companyAddress, 50, 80);
  doc.text(`Phone: ${companyPhone}`, 50, 95);
  doc.text(`Email: ${companyEmail}`, 50, 110);

  // Invoice details
  doc.fontSize(16).text('INVOICE', 400, 50);
  doc.fontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 400, 80);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 400, 95);
  doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 400, 110);

  // Customer details
  if (invoice.customer) {
    doc.text('Bill To:', 50, 150);
    doc.text(invoice.customer.name, 50, 170);
    if (invoice.customer.address) {
      doc.text(invoice.customer.address, 50, 185);
    }
    if (invoice.customer.phone) {
      doc.text(`Phone: ${invoice.customer.phone}`, 50, 200);
    }
    if (invoice.customer.email) {
      doc.text(`Email: ${invoice.customer.email}`, 50, 215);
    }
  }

  // Table header
  const tableTop = 250;
  const itemCodeX = 50;
  const descriptionX = 120;
  const quantityX = 350;
  const priceX = 400;
  const totalX = 500;

  doc.fontSize(10);
  doc.text('Item Code', itemCodeX, tableTop);
  doc.text('Description', descriptionX, tableTop);
  doc.text('Qty', quantityX, tableTop);
  doc.text('Price', priceX, tableTop);
  doc.text('Total', totalX, tableTop);

  // Draw line under header
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

  // Table rows
  let currentY = tableTop + 30;
  invoice.items.forEach((item: InvoiceItem, index: number) => {
    const product = typeof item.product === 'string' ? item.product : item.product.name;
    const productCode = typeof item.product === 'string' ? item.product : item.product.sku;
    
    doc.text(productCode, itemCodeX, currentY);
    doc.text(product, descriptionX, currentY);
    doc.text(item.quantity.toString(), quantityX, currentY);
    doc.text(`${currency}${item.price.toFixed(2)}`, priceX, currentY);
    doc.text(`${currency}${item.total.toFixed(2)}`, totalX, currentY);
    
    currentY += 20;
  });

  // Draw line under items
  doc.moveTo(50, currentY).lineTo(550, currentY).stroke();

  // Totals
  const totalsY = currentY + 20;
  doc.text('Subtotal:', 400, totalsY);
  doc.text(`${currency}${invoice.subtotal.toFixed(2)}`, totalX, totalsY);
  
  if (invoice.discount > 0) {
    doc.text('Discount:', 400, totalsY + 20);
    doc.text(`-${currency}${invoice.discount.toFixed(2)}`, totalX, totalsY + 20);
  }
  
  const taxAmount = invoice.tax || (invoice.subtotal * taxRate);
  doc.text('Tax:', 400, totalsY + (invoice.discount > 0 ? 40 : 20));
  doc.text(`${currency}${taxAmount.toFixed(2)}`, totalX, totalsY + (invoice.discount > 0 ? 40 : 20));
  
  const finalTotal = invoice.total;
  doc.fontSize(12).text('Total:', 400, totalsY + (invoice.discount > 0 ? 60 : 40));
  doc.text(`${currency}${finalTotal.toFixed(2)}`, totalX, totalsY + (invoice.discount > 0 ? 60 : 40));

  // Payment method
  doc.fontSize(10).text(`Payment Method: ${invoice.paymentMethod.toUpperCase()}`, 50, totalsY + (invoice.discount > 0 ? 80 : 60));

  // Notes
  if (invoice.notes) {
    doc.text('Notes:', 50, totalsY + (invoice.discount > 0 ? 100 : 80));
    doc.text(invoice.notes, 50, totalsY + (invoice.discount > 0 ? 120 : 100));
  }

  // Footer
  const footerY = 750;
  doc.fontSize(8).text('Thank you for your business!', 50, footerY);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 50, footerY + 15);

  return doc;
}

export function generateInvoicePDFBuffer(
  invoice: Invoice,
  options?: InvoicePDFOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = generateInvoicePDF(invoice, options);
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    doc.end();
  });
}
