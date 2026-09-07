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

function emptyVendorAnalytics(): VendorAnalytics {
  return {
    salesSeries: [],
    revenueSeries: [],
    productPerformance: [],
    customerActivity: [],
    visitorCount: 0,
    orders: 0,
    revenue: 0,
  };
}

function emptyAdminAnalytics(): AdminAnalytics {
  return {
    vendorGrowth: [],
    userGrowth: [],
    orderSeries: [],
    revenueSeries: [],
    commissionSeries: [],
    totalVendors: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalReviews: 0,
    pendingProducts: 0,
    platformRevenue: 0,
    commissionEarnings: 0,
    topCategories: [],
    topVendors: [],
    topProducts: [],
  };
}

export const analyticsService = {
  async getVendorAnalytics(token?: string | null): Promise<VendorAnalytics> {
    if (!token) return emptyVendorAnalytics();
    const res = await apiRequest<{
      data: {
        salesByDay: Array<{ day: string; orders: number; revenue: number }>;
        topProducts: Array<{ id: number; name: string; units_sold: number; revenue: number }>;
        visitorCount: number;
      };
    }>('/vendor/analytics', { token });
    const sales = res.data.salesByDay || [];
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
      customerActivity: [],
      visitorCount: res.data.visitorCount || 0,
      orders: sales.reduce((s, r) => s + Number(r.orders), 0),
      revenue: sales.reduce((s, r) => s + Number(r.revenue), 0),
    };
  },

  async getAdminAnalytics(token?: string | null): Promise<AdminAnalytics> {
    if (!token) return emptyAdminAnalytics();
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
  },
};
