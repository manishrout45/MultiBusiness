import { apiRequest } from '@/lib/api';

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface VendorAnalytics {
  salesSeries: ChartPoint[];
  revenueSeries: ChartPoint[];
  productPerformance: ProductPerformance[];
  customerActivity: ChartPoint[];
  visitorCount: number;
  orders: number;
  revenue: number;
}

export interface AdminAnalytics {
  vendorGrowth: ChartPoint[];
  userGrowth: ChartPoint[];
  orderSeries: ChartPoint[];
  revenueSeries: ChartPoint[];
  commissionSeries: ChartPoint[];
  totalVendors: number;
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  totalReviews: number;
  pendingProducts: number;
  platformRevenue: number;
  commissionEarnings: number;
  topCategories: Array<{ name: string; businessCount: number }>;
  topVendors: Array<{ id: string; name: string; orderCount: number; revenue: number }>;
  topProducts: Array<{
    id: string;
    name: string;
    businessName: string;
    unitsSold: number;
    revenue: number;
  }>;
}

function lastNDays(n: number, baseValues: number[]): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const idx = (n - 1 - i) % baseValues.length;
    points.push({ label, value: baseValues[idx] });
  }
  return points;
}

const MOCK_VENDOR_ANALYTICS: VendorAnalytics = {
  salesSeries: lastNDays(14, [4, 6, 3, 8, 5, 9, 7, 11, 6, 10, 8, 12, 9, 14]),
  revenueSeries: lastNDays(14, [8200, 12400, 6100, 15800, 9200, 18400, 14100, 21000, 11800, 19500, 16200, 24000, 17800, 26500]),
  productPerformance: [
    { id: '1', name: 'Wireless Earbuds', unitsSold: 120, revenue: 96000 },
    { id: '2', name: 'Smart Watch', unitsSold: 85, revenue: 127500 },
    { id: '3', name: 'Phone Case', unitsSold: 210, revenue: 42000 },
    { id: '4', name: 'USB-C Hub', unitsSold: 64, revenue: 51200 },
  ],
  customerActivity: lastNDays(7, [22, 31, 18, 40, 35, 48, 42]),
  visitorCount: 1240,
  orders: 156,
  revenue: 248500,
};

const MOCK_ADMIN_ANALYTICS: AdminAnalytics = {
  vendorGrowth: lastNDays(12, [120, 128, 135, 142, 150, 158, 165, 172, 178, 182, 184, 186]),
  userGrowth: lastNDays(12, [800, 850, 890, 940, 980, 1020, 1080, 1120, 1160, 1190, 1220, 1240]),
  orderSeries: lastNDays(14, [40, 55, 48, 62, 70, 58, 75, 80, 68, 90, 85, 95, 88, 102]),
  revenueSeries: lastNDays(14, [180000, 210000, 195000, 240000, 265000, 220000, 290000, 310000, 275000, 340000, 320000, 360000, 345000, 380000]),
  commissionSeries: lastNDays(14, [18000, 21000, 19500, 24000, 26500, 22000, 29000, 31000, 27500, 34000, 32000, 36000, 34500, 38000]),
  totalVendors: 186,
  totalCustomers: 980,
  totalOrders: 8930,
  totalProducts: 4520,
  totalReviews: 420,
  pendingProducts: 18,
  platformRevenue: 4250000,
  commissionEarnings: 425000,
  topCategories: [
    { name: 'Retail', businessCount: 42 },
    { name: 'Electronics', businessCount: 28 },
    { name: 'Food', businessCount: 21 },
  ],
  topVendors: [
    { id: '1', name: 'Green Grocery Mart', orderCount: 120, revenue: 240000 },
    { id: '2', name: 'TechFix Hub', orderCount: 88, revenue: 198000 },
  ],
  topProducts: [
    { id: '1', name: 'Wireless Earbuds', businessName: 'TechFix Hub', unitsSold: 120, revenue: 96000 },
    { id: '2', name: 'Organic Rice 5kg', businessName: 'Green Grocery Mart', unitsSold: 95, revenue: 47500 },
  ],
};

export const analyticsService = {
  async getVendorAnalytics(token?: string | null): Promise<VendorAnalytics> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            salesByDay: Array<{ day: string; orders: number; revenue: number }>;
            topProducts: Array<{ id: number; name: string; units_sold: number; revenue: number }>;
            visitorCount: number;
          };
        }>('/vendor/analytics', { token });
        const sales = res.data.salesByDay || [];
        if (sales.length) {
          return {
            salesSeries: sales.map((r) => ({
              label: new Date(r.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              value: Number(r.orders),
            })),
            revenueSeries: sales.map((r) => ({
              label: new Date(r.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              value: Number(r.revenue),
            })),
            productPerformance: (res.data.topProducts || []).map((p) => ({
              id: String(p.id),
              name: p.name,
              unitsSold: Number(p.units_sold),
              revenue: Number(p.revenue),
            })),
            customerActivity: MOCK_VENDOR_ANALYTICS.customerActivity,
            visitorCount: res.data.visitorCount,
            orders: sales.reduce((s, r) => s + Number(r.orders), 0),
            revenue: sales.reduce((s, r) => s + Number(r.revenue), 0),
          };
        }
      } catch {
        // fall through
      }
    }
    return MOCK_VENDOR_ANALYTICS;
  },

  async getAdminAnalytics(token?: string | null): Promise<AdminAnalytics> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            userGrowth: Array<{ label: string; value: number }>;
            vendorGrowth: Array<{ label: string; value: number }>;
            orderSeries: Array<{ label: string; value: number }>;
            revenueSeries: Array<{ label: string; value: number }>;
            commissionSeries: Array<{ label: string; value: number }>;
            topCategories: Array<{ name: string; businessCount: number }>;
            topVendors: Array<{ id: string; name: string; orderCount: number; revenue: number }>;
            topProducts: Array<{
              id: string;
              name: string;
              businessName: string;
              unitsSold: number;
              revenue: number;
            }>;
            totals: {
              customers: number;
              vendors: number;
              orders: number;
              revenue: number;
              commissions: number;
              products: number;
              reviews: number;
            };
          };
        }>('/admin/analytics', { token });

        const dash = await apiRequest<{
          data: { pendingProducts?: number };
        }>('/admin/dashboard', { token }).catch(() => null);

        const d = res.data;
        return {
          userGrowth: d.userGrowth || [],
          vendorGrowth: d.vendorGrowth || [],
          orderSeries: d.orderSeries || [],
          revenueSeries: d.revenueSeries || [],
          commissionSeries: d.commissionSeries || [],
          topCategories: d.topCategories || [],
          topVendors: d.topVendors || [],
          topProducts: d.topProducts || [],
          totalCustomers: d.totals?.customers ?? 0,
          totalVendors: d.totals?.vendors ?? 0,
          totalOrders: d.totals?.orders ?? 0,
          totalProducts: d.totals?.products ?? 0,
          totalReviews: d.totals?.reviews ?? 0,
          pendingProducts: dash?.data?.pendingProducts ?? 0,
          platformRevenue: d.totals?.revenue ?? 0,
          commissionEarnings: d.totals?.commissions ?? 0,
        };
      } catch {
        // fall through
      }
    }
    return MOCK_ADMIN_ANALYTICS;
  },
};
