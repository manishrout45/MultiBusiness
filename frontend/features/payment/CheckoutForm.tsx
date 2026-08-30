'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { useCart } from '@/hooks/useCart';
import { PaymentMethod } from '@/features/payment/PaymentMethod';
import { PaymentSummary } from '@/features/payment/PaymentSummary';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/lib/constants';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';

export function CheckoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();
  const { items, totals, clearCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!items.length) {
      toast({ title: 'Cart is empty', variant: 'error' });
      return;
    }
    if (!shippingAddress.trim() || !phone.trim()) {
      toast({ title: 'Fill delivery details', description: 'Address and phone are required.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const orders = await orderService.checkout(
        {
          shippingAddress: shippingAddress.trim(),
          phone: phone.trim(),
          paymentMethod,
          cartItems: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            vendorId: i.vendorId,
            vendorName: i.vendorName,
            quantity: i.quantity,
            price: i.price,
          })),
        },
        token
      );

      const payment = await paymentService.processPayment(paymentMethod, orders);
      clearCart();

      const params = new URLSearchParams({
        status: payment.status,
        orders: payment.orderIds.join(','),
        numbers: payment.orderNumbers.join(','),
      });

      toast({
        title: payment.status === 'success' ? 'Order placed' : 'Processing payment',
        description: payment.message,
        variant: payment.status === 'failed' ? 'error' : 'success',
      });

      router.push(`/payment?${params.toString()}`);
    } catch (err) {
      toast({
        title: 'Checkout failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Delivery address</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="House no., street, city, pincode"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Contact number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground">
                Sign in to sync orders with your account. Guest checkout uses local storage.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting || !items.length}>
          {isSubmitting ? 'Placing order…' : 'Place order'}
        </Button>
      </div>

      <PaymentSummary totals={totals} paymentMethodLabel={methodLabel} />
    </form>
  );
}
