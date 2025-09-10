'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useBillingStore } from '@/store/billingStore';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { 
  ShoppingCartIcon, 
  QrCodeIcon, 
  MicrophoneIcon, 
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  PrinterIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const {
    cart,
    customer,
    subtotal,
    tax,
    discount,
    total,
    paymentMethod,
    notes,
    isVoiceEnabled,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomer,
    setPaymentMethod,
    setNotes,
    setTax,
    setDiscount,
    calculateTotal,
    toggleVoice,
    processVoiceCommand,
  } = useBillingStore();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { transcript, isListening, isSupported: voiceSupported, startListening, stopListening } = useVoiceRecognition({
    onCommand: (command) => {
      processVoiceCommand(command.command);
      if (command.action === 'add_product') {
        // Handle voice product addition
        toast.success(`Voice command: ${command.command}`);
      }
    },
    onError: (error) => {
      toast.error(`Voice recognition error: ${error}`);
    },
  });

  const { speak, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    calculateTotal();
  }, [cart, tax, discount, calculateTotal]);

  const handleQRScan = async (qrData: string) => {
    try {
      const response = await fetch('/api/billing/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();
      if (data.success) {
        addToCart(data.data.product, 1);
        toast.success(`Added ${data.data.product.name} to cart`);
        speak(`Added ${data.data.product.name} to cart`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error('Failed to scan QR code');
    }
  };

  const handleCreateInvoice = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!customer.name) {
      toast.error('Customer name is required');
      return;
    }

    setIsCreatingInvoice(true);

    try {
      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer,
          items: cart,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Invoice created successfully!');
        clearCart();
        speak('Invoice created successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Create invoice error:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print invoice');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Billing
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create invoices and process payments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsQRScannerOpen(true)}
            >
              <QrCodeIcon className="h-5 w-5 mr-2" />
              Scan QR
            </Button>
            <Button
              variant={isVoiceEnabled ? 'primary' : 'outline'}
              onClick={toggleVoice}
              disabled={!voiceSupported}
            >
              <MicrophoneIcon className="h-5 w-5 mr-2" />
              {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
            </Button>
          </div>
        </div>

        {/* Voice Status */}
        {isVoiceEnabled && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isListening ? 'Listening...' : 'Voice recognition ready'}
                </span>
                {transcript && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    "{transcript}"
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Add Products</CardTitle>
                <CardDescription>
                  Search for products to add to the cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={() => setIsQRScannerOpen(true)}>
                    <QrCodeIcon className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
                <CardDescription>
                  {cart.length} item(s) in cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <ShoppingCartIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {typeof item.product === 'string' ? item.product : item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(
                              typeof item.product === 'string' ? item.product : item.product._id,
                              item.quantity - 1
                            )}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(
                              typeof item.product === 'string' ? item.product : item.product._id,
                              item.quantity + 1
                            )}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(
                              typeof item.product === 'string' ? item.product : item.product._id
                            )}
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Details */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Name *</Label>
                  <Input
                    id="customerName"
                    value={customer.name}
                    onChange={(e) => setCustomer({ name: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customer.email || ''}
                    onChange={(e) => setCustomer({ email: e.target.value })}
                    placeholder="Enter customer email"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customer.phone || ''}
                    onChange={(e) => setCustomer({ phone: e.target.value })}
                    placeholder="Enter customer phone"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="input"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="input min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={isCreatingInvoice || cart.length === 0}
                    className="w-full"
                  >
                    {isCreatingInvoice ? 'Creating...' : 'Create Invoice'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {isQRScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>
                  Scan a product QR code to add it to the cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      QR Scanner would be implemented here
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsQRScannerOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // Mock QR scan for demo
                        handleQRScan(JSON.stringify({
                          type: 'product',
                          id: 'mock-id',
                          sku: 'DEMO-001',
                          name: 'Demo Product',
                          price: 100,
                        }));
                        setIsQRScannerOpen(false);
                      }}
                      className="flex-1"
                    >
                      Mock Scan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

