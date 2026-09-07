import { apiRequest } from '@/lib/api';

export interface CommissionSetting {
  id: string;
  rate: number;
  categoryName?: string | null;
  businessName?: string | null;
  scope: string;
}

export interface CommissionEarningRow {
  id: string;
  vendorName: string;
  orderCount: number;
  grossSales: number;
  commissionAmount: number;
  vendorPayout: number;
  period: string;
}

export interface VendorCommissionSummary {
  rate: number;
  totalSales: number;
  commissionDeducted: number;
  netEarnings: number;
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
    note: string;
  }>;
}

export const commissionService = {
  async listSettings(token?: string | null): Promise<CommissionSetting[]> {
    if (!token) return [];
    const res = await apiRequest<{
      data: Array<{
        id: number;
        rate: number;
        category_name?: string | null;
        business_name?: string | null;
      }>;
    }>('/admin/commissions', { token });
    return (res.data || []).map((row) => ({
      id: String(row.id),
      rate: Number(row.rate),
      categoryName: row.category_name,
      businessName: row.business_name,
      scope: row.business_name
        ? 'Vendor'
        : row.category_name
          ? 'Category'
          : 'Global default',
    }));
  },

  async updateRate(id: string, rate: number, token?: string | null): Promise<void> {
    if (!token) return;
    await apiRequest(`/admin/commissions/${id}`, {
      method: 'PATCH',
      token,
      body: { rate },
    });
  },

  async getEarningsReport(token?: string | null): Promise<CommissionEarningRow[]> {
    if (!token) return [];
    const res = await apiRequest<{ data: CommissionEarningRow[] }>(
      '/admin/commissions/earnings',
      { token }
    );
    return res.data || [];
  },

  async getVendorCommission(token?: string | null): Promise<VendorCommissionSummary> {
    if (!token) {
      return {
        rate: 0,
        totalSales: 0,
        commissionDeducted: 0,
        netEarnings: 0,
        paymentHistory: [],
      };
    }
    const res = await apiRequest<{
      data: {
        revenue: number;
        commission: number;
        vendorAmount: number;
        commissionBreakdown?: { rate: number };
      };
    }>('/vendor/dashboard', { token });
    return {
      rate: res.data.commissionBreakdown?.rate ?? 0,
      totalSales: Number(res.data.revenue) || 0,
      commissionDeducted: Number(res.data.commission) || 0,
      netEarnings: Number(res.data.vendorAmount) || 0,
      paymentHistory: [],
    };
  },
};
