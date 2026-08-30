import type { OrderStatus, PaymentMethodId } from '@/lib/constants';
import { mapBackendOrderStatus } from '@/lib/constants';
import { apiRequest } from '@/lib/api';

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderVendorInfo {
  id: string;
  name: string;
  phone?: string;
  city?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  vendor: OrderVendorInfo;
  items: OrderLineItem[];
  createdAt: string;
  updatedAt?: string;
  trackingNumber?: string | null;
}

interface ApiOrderRow {
  id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_address: string;
  phone: string;
  business_id: number;
  business_name?: string;
  created_at: string;
  updated_at?: string;
  tracking_number?: string | null;
}

interface ApiOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

function mapOrderSummary(row: ApiOrderRow, business?: OrderVendorInfo | null): Order {
  return {
    id: String(row.id),
    orderNumber: row.order_number,
    status: mapBackendOrderStatus(row.order_status),
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    totalAmount: Number(row.total_amount),
    shippingAddress: row.shipping_address,
    phone: row.phone,
    vendor: business ?? {
      id: String(row.business_id),
      name: row.business_name ?? 'Vendor',
    },
    items: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    trackingNumber: row.tracking_number,
  };
}

function mapOrderItems(items: ApiOrderItem[]): OrderLineItem[] {
  return items.map((i) => ({
    id: String(i.id),
    productId: String(i.product_id),
    productName: i.product_name,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unit_price),
    totalPrice: Number(i.total_price),
  }));
}

const LOCAL_ORDERS_KEY = 'marketplace_orders_v1';

function loadLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

export const orderService = {
  async listOrders(token?: string | null): Promise<Order[]> {
    if (token) {
      try {
        const res = await apiRequest<{ data: ApiOrderRow[] }>('/customer/orders', { token });
        return res.data.map((row) => mapOrderSummary(row));
      } catch {
        // fall through
      }
    }
    return loadLocalOrders();
  },

  async getOrder(id: string, token?: string | null): Promise<Order | null> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: ApiOrderRow & {
            items: ApiOrderItem[];
            business: { id: number; business_name: string; phone?: string; city?: string } | null;
          };
        }>(`/customer/orders/${id}`, { token });
        const { items, business, ...orderRow } = res.data;
        const order = mapOrderSummary(orderRow, business
          ? {
              id: String(business.id),
              name: business.business_name,
              phone: business.phone,
              city: business.city,
            }
          : null);
        order.items = mapOrderItems(items);
        return order;
      } catch {
        // fall through
      }
    }
    return loadLocalOrders().find((o) => o.id === id) ?? null;
  },

  async trackOrder(id: string, token?: string | null) {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            orderNumber: string;
            orderStatus: string;
            paymentStatus: string;
            trackingNumber?: string | null;
            updatedAt?: string;
            createdAt: string;
          };
        }>(`/customer/orders/${id}/track`, { token });
        return {
          ...res.data,
          status: mapBackendOrderStatus(res.data.orderStatus),
        };
      } catch {
        // fall through
      }
    }
    const order = loadLocalOrders().find((o) => o.id === id);
    if (!order) return null;
    return {
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      updatedAt: order.updatedAt,
      createdAt: order.createdAt,
      status: order.status,
    };
  },

  async checkout(
    payload: {
      shippingAddress: string;
      phone: string;
      paymentMethod: PaymentMethodId;
      cartItems: {
        productId: string;
        productName: string;
        vendorId: string;
        vendorName: string;
        quantity: number;
        price: number;
      }[];
    },
    token?: string | null
  ): Promise<Order[]> {
    if (token) {
      try {
        const res = await apiRequest<{ data: (ApiOrderRow & { items: ApiOrderItem[] })[] }>(
          '/customer/checkout',
          {
            method: 'POST',
            token,
            body: {
              shippingAddress: payload.shippingAddress,
              phone: payload.phone,
              paymentMethod: payload.paymentMethod,
            },
          }
        );
        return res.data.map((row) => {
          const { items, ...orderRow } = row;
          const order = mapOrderSummary(orderRow);
          order.items = mapOrderItems(items);
          return order;
        });
      } catch {
        // fall through to local mock order
      }
    }

    const grouped = new Map<string, typeof payload.cartItems>();
    for (const item of payload.cartItems) {
      const list = grouped.get(item.vendorId) ?? [];
      list.push(item);
      grouped.set(item.vendorId, list);
    }

    const created: Order[] = [];
    for (const [vendorId, items] of grouped) {
      const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const order: Order = {
        id: `local-order-${Date.now()}-${vendorId}`,
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
        status: 'pending',
        paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentMethod: payload.paymentMethod,
        totalAmount: Math.round(totalAmount * 100) / 100,
        shippingAddress: payload.shippingAddress,
        phone: payload.phone,
        vendor: { id: vendorId, name: items[0]?.vendorName ?? 'Vendor' },
        items: items.map((i, idx) => ({
          id: `line-${idx}`,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: Math.round(i.price * i.quantity * 100) / 100,
        })),
        createdAt: new Date().toISOString(),
      };
      created.push(order);
    }

    const existing = loadLocalOrders();
    saveLocalOrders([...created, ...existing]);
    return created;
  },
};
