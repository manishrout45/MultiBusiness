import { apiRequest } from '@/lib/api';
import type { SuccessStoriesData } from '@/components/success-stories/types';

export async function fetchSuccessStories(): Promise<SuccessStoriesData> {
  try {
    const stats = await apiRequest<{
      data: {
        vendors: number;
        customers: number;
        ordersDelivered: number;
        products: number;
        reviews: number;
        cities: number;
      };
    }>('/platform/stats');

    return {
      updatedAt: new Date().toISOString(),
      stats: [
        { id: 'vendors', value: String(stats.data.vendors), label: 'Vendors' },
        { id: 'customers', value: String(stats.data.customers), label: 'Customers' },
        {
          id: 'orders',
          value: String(stats.data.ordersDelivered),
          label: 'Orders delivered',
        },
        { id: 'products', value: String(stats.data.products), label: 'Products' },
        { id: 'reviews', value: String(stats.data.reviews), label: 'Reviews' },
        { id: 'cities', value: String(stats.data.cities), label: 'Cities' },
      ],
    };
  } catch {
    return { updatedAt: new Date().toISOString(), stats: [] };
  }
}
