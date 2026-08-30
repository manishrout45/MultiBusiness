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
  platformRevenue: number;
  commissionEarnings: number;
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
  platformRevenue: 4250000,
  commissionEarnings: 425000,
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
        const [salesRes, revenueRes] = await Promise.all([
          apiRequest<{ data: unknown }>('/admin/reports/sales', { token }).catch(() => null),
          apiRequest<{ data: unknown }>('/admin/reports/revenue', { token }).catch(() => null),
        ]);
        if (salesRes || revenueRes) {
          // Reports shape varies — enrich mock with live dashboard totals when available
          const dash = await apiRequest<{
            data: { orders: number; revenue: number; commissions: number; users: number; businesses: { approved: number } };
          }>('/admin/dashboard', { token });
          return {
            ...MOCK_ADMIN_ANALYTICS,
            totalOrders: dash.data.orders,
            platformRevenue: dash.data.revenue,
            commissionEarnings: dash.data.commissions,
            totalCustomers: Math.max(0, dash.data.users - (dash.data.businesses.approved || 0)),
            totalVendors: dash.data.businesses.approved || 0,
          };
        }
      } catch {
        // fall through
      }
    }
    return MOCK_ADMIN_ANALYTICS;
  },
};
