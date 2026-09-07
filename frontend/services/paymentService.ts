import type { PaymentMethodId, PaymentStatus } from '@/lib/constants';
import type { Order } from '@/services/orderService';
import { apiRequest } from '@/lib/api';

export interface CheckoutPayload {
  shippingAddress: string;
  phone: string;
  paymentMethod: PaymentMethodId;
}

export interface PaymentResult {
  status: PaymentStatus;
  orderIds: string[];
  orderNumbers: string[];
  message: string;
  gateway?: 'razorpay' | 'stripe' | 'none';
}

export const paymentGatewayConfig = {
  razorpay: {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
    enabled: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
    enabled: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  },
};

export const paymentService = {
  async processPayment(
    paymentMethod: PaymentMethodId,
    orders: Order[],
    gateway?: Array<Record<string, unknown>>
  ): Promise<PaymentResult> {
    const orderIds = orders.map((o) => o.id);
    const orderNumbers = orders.map((o) => o.orderNumber);

    if (paymentMethod === 'cod') {
      return {
        status: 'success',
        orderIds,
        orderNumbers,
        message: 'Order placed. Pay on delivery.',
        gateway: 'none',
      };
    }

    if (paymentMethod === 'wallet') {
      return {
        status: 'success',
        orderIds,
        orderNumbers,
        message: 'Order paid with wallet.',
        gateway: 'none',
      };
    }

    const first = gateway?.[0];
    if (first?.configured && first?.provider === 'razorpay' && first?.keyId) {
      return {
        status: 'pending',
        orderIds,
        orderNumbers,
        message: 'Complete Razorpay checkout to confirm payment.',
        gateway: 'razorpay',
      };
    }

    return {
      status: 'pending',
      orderIds,
      orderNumbers,
      message:
        'Order placed with pending payment. Online gateway is not configured — use COD or wallet, or set Razorpay keys.',
      gateway: 'none',
    };
  },

  async confirmRazorpayPayment(
    payload: {
      orderId: string;
      paymentId: string;
      signature: string;
      gatewayOrderId?: string;
    },
    token?: string | null
  ) {
    return apiRequest('/customer/payments/confirm', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  getPaymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      pending: 'Payment pending',
      success: 'Payment successful',
      failed: 'Payment failed',
    };
    return labels[status];
  },
};
