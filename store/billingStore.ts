import { create } from 'zustand';
import { Product, InvoiceItem } from '@/types';

interface BillingState {
  cart: InvoiceItem[];
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  notes: string;
  isVoiceEnabled: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customer: Partial<BillingState['customer']>) => void;
  setPaymentMethod: (method: BillingState['paymentMethod']) => void;
  setNotes: (notes: string) => void;
  setTax: (tax: number) => void;
  setDiscount: (discount: number) => void;
  calculateTotal: () => void;
  toggleVoice: () => void;
  processVoiceCommand: (command: string) => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  cart: [],
  customer: {
    name: '',
  },
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  paymentMethod: 'cash',
  notes: '',
  isVoiceEnabled: false,

  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existingItem = cart.find(item => 
      typeof item.product === 'string' ? item.product === product._id : item.product._id === product._id
    );

    if (existingItem) {
      set({
        cart: cart.map(item =>
          typeof item.product === 'string' ? 
            item.product === product._id ? 
              { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
              : item
            : item.product._id === product._id ?
              { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
              : item
        ),
      });
    } else {
      set({
        cart: [
          ...cart,
          {
            product: product._id,
            quantity,
            price: product.price,
            total: quantity * product.price,
          },
        ],
      });
    }
    get().calculateTotal();
  },

  removeFromCart: (productId) => {
    const { cart } = get();
    set({
      cart: cart.filter(item =>
        typeof item.product === 'string' ? item.product !== productId : item.product._id !== productId
      ),
    });
    get().calculateTotal();
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const { cart } = get();
    set({
      cart: cart.map(item =>
        typeof item.product === 'string' ?
          item.product === productId ?
            { ...item, quantity, total: quantity * item.price }
            : item
          : item.product._id === productId ?
            { ...item, quantity, total: quantity * item.price }
            : item
      ),
    });
    get().calculateTotal();
  },

  clearCart: () => {
    set({
      cart: [],
      customer: { name: '' },
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      notes: '',
    });
  },

  setCustomer: (customer) => {
    set({ customer: { ...get().customer, ...customer } });
  },

  setPaymentMethod: (paymentMethod) => {
    set({ paymentMethod });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  setTax: (tax) => {
    set({ tax });
    get().calculateTotal();
  },

  setDiscount: (discount) => {
    set({ discount });
    get().calculateTotal();
  },

  calculateTotal: () => {
    const { cart, tax, discount } = get();
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + tax - discount;
    set({ subtotal, total });
  },

  toggleVoice: () => {
    set({ isVoiceEnabled: !get().isVoiceEnabled });
  },

  processVoiceCommand: (command) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('clear cart')) {
      get().clearCart();
    } else if (lowerCommand.includes('calculate total')) {
      get().calculateTotal();
    }
    // Add more voice command processing here
  },
}));

