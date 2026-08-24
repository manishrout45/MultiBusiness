import type { PaymentMethodId, PaymentStatus } from '@/lib/constants';
import type { Order } from '@/services/orderService';

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
  gateway?: 'razorpay' | 'stripe' | 'mock';
}

/** Gateway config placeholders for future integration */
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
  /**
   * Process payment after checkout. When gateway keys are configured,
   * this is where Razorpay/Stripe SDK calls would be initiated.
   */
  async processPayment(
    paymentMethod: PaymentMethodId,
    orders: Order[]
  ): Promise<PaymentResult> {
    const orderIds = orders.map((o) => o.id);
    const orderNumbers = orders.map((o) => o.orderNumber);

    if (paymentMethod === 'cod') {
      return {
        status: 'success',
        orderIds,
        orderNumbers,
        message: 'Order placed. Pay on delivery.',
        gateway: 'mock',
      };
    }

    if (paymentGatewayConfig.razorpay.enabled) {
      // Future: load Razorpay checkout script and open modal
      return {
        status: 'pending',
        orderIds,
        orderNumbers,
        message: 'Redirecting to Razorpay…',
        gateway: 'razorpay',
      };
    }

    if (paymentGatewayConfig.stripe.enabled) {
      return {
        status: 'pending',
        orderIds,
        orderNumbers,
        message: 'Redirecting to Stripe…',
        gateway: 'stripe',
      };
    }

    // Simulated instant success for card/UPI/net banking without gateway keys
    await new Promise((r) => setTimeout(r, 800));
    return {
      status: 'success',
      orderIds,
      orderNumbers,
      message: 'Payment successful. Your order is confirmed.',
      gateway: 'mock',
    };
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
