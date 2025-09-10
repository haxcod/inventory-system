import QRCode from 'qrcode';
import { Product } from '@/types';

export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: 200,
    height: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M' as const,
    ...options,
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function generateProductQRData(product: Product): string {
  if (!product || !product._id || !product.sku || !product.name || typeof product.price !== 'number') {
    throw new Error('Invalid product data: missing required fields');
  }
  
  return JSON.stringify({
    type: 'product',
    id: product._id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    branch: product.branch,
  });
}

export async function generateProductQRCode(
  product: Product,
  options?: QRCodeOptions
): Promise<string> {
  const qrData = generateProductQRData(product);
  return generateQRCode(qrData, options);
}

export function parseQRCodeData(qrData: string): any {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
}

export function validateProductQRData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  return (
    data.type === 'product' &&
    !!data.id &&
    !!data.sku &&
    !!data.name &&
    typeof data.price === 'number' &&
    data.price > 0
  );
}

