export const APP_NAME = 'LocalMart';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const DEFAULT_LOCATION = {
  city: 'Bhubaneswar',
  state: 'Odisha',
  label: 'Bhubaneswar, Odisha',
} as const;

export const NAV_QUICK_CATEGORIES = [
  { name: 'Restaurants', slug: 'restaurant', icon: 'utensils' },
  { name: 'Shopping', slug: 'retail', icon: 'shopping-bag' },
  { name: 'Electronics', slug: 'electronics', icon: 'cpu' },
  { name: 'Home & Living', slug: 'services', icon: 'home' },
  { name: 'Services', slug: 'services', icon: 'wrench' },
  { name: 'Beauty', slug: 'services', icon: 'sparkles' },
  { name: 'Education', slug: 'education', icon: 'graduation-cap' },
  { name: 'Healthcare', slug: 'healthcare', icon: 'heart-pulse' },
  { name: 'Travel', slug: 'travel', icon: 'plane' },
] as const;

export const HOMEPAGE_CATEGORIES = [
  { name: 'Restaurants', slug: 'restaurant', tint: 'bg-orange-50 text-orange-600', blurb: 'Eat nearby', icon: 'utensils' },
  { name: 'Shopping', slug: 'retail', tint: 'bg-secondary text-primary', blurb: 'Local stores', icon: 'shopping-bag' },
  { name: 'Electronics', slug: 'electronics', tint: 'bg-sky-50 text-[hsl(var(--trust))]', blurb: 'Gadgets', icon: 'cpu' },
  { name: 'Home & Living', slug: 'services', tint: 'bg-amber-50 text-amber-700', blurb: 'Decor & more', icon: 'home' },
  { name: 'Services', slug: 'services', tint: 'bg-violet-50 text-[hsl(var(--services))]', blurb: 'Pros near you', icon: 'wrench' },
  { name: 'Beauty', slug: 'services', tint: 'bg-pink-50 text-pink-600', blurb: 'Salons & spa', icon: 'sparkles' },
  { name: 'Education', slug: 'education', tint: 'bg-indigo-50 text-indigo-600', blurb: 'Learn locally', icon: 'graduation-cap' },
  { name: 'Healthcare', slug: 'healthcare', tint: 'bg-emerald-50 text-primary', blurb: 'Care & clinics', icon: 'heart-pulse' },
  { name: 'Travel', slug: 'travel', tint: 'bg-cyan-50 text-cyan-700', blurb: 'Trips & tours', icon: 'plane' },
] as const;

/** @deprecated use HOMEPAGE_CATEGORIES */
export const POPULAR_CATEGORIES = HOMEPAGE_CATEGORIES;

export const MARKETPLACE_CATEGORIES = [
  { id: 'retail', name: 'Retail', slug: 'retail', description: 'Stores and shopping destinations' },
  { id: 'restaurant', name: 'Restaurant', slug: 'restaurant', description: 'Dining, cafes, and food services' },
  { id: 'real-estate', name: 'Real Estate', slug: 'real-estate', description: 'Property and housing services' },
  { id: 'healthcare', name: 'Healthcare', slug: 'healthcare', description: 'Clinics, wellness, and care' },
  { id: 'education', name: 'Education', slug: 'education', description: 'Schools, coaching, and training' },
  { id: 'travel', name: 'Travel', slug: 'travel', description: 'Tours, agencies, and transport' },
  { id: 'services', name: 'Services', slug: 'services', description: 'Professional and home services' },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and repairs' },
] as const;

export const DEFAULT_WORKING_HOURS = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
} as const;

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const CART_STORAGE_KEY = 'marketplace_cart_v1';
export const REVIEWS_STORAGE_KEY = 'marketplace_reviews_v1';

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', description: 'Pay via UPI apps' },
  { id: 'credit_card', label: 'Credit Card', description: 'Visa, Mastercard, RuPay' },
  { id: 'debit_card', label: 'Debit Card', description: 'Bank debit cards' },
  { id: 'net_banking', label: 'Net Banking', description: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive' },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'success', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Map Express/MySQL order_status to UI status */
export function mapBackendOrderStatus(status: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    placed: 'pending',
    pending: 'pending',
    accepted: 'confirmed',
    confirmed: 'confirmed',
    packed: 'processing',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    returned: 'cancelled',
  };
  return map[status] ?? 'pending';
}

export function formatOrderStatus(status: OrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
