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

const MOCK_SETTINGS: CommissionSetting[] = [
  { id: '1', rate: 10, scope: 'Global default', categoryName: null, businessName: null },
  { id: '2', rate: 8, scope: 'Category', categoryName: 'Electronics', businessName: null },
  { id: '3', rate: 12, scope: 'Category', categoryName: 'Restaurant', businessName: null },
];

const MOCK_EARNINGS: CommissionEarningRow[] = [
  {
    id: 'e1',
    vendorName: 'Sharma Electronics',
    orderCount: 156,
    grossSales: 248500,
    commissionAmount: 24850,
    vendorPayout: 223650,
    period: 'This month',
  },
  {
    id: 'e2',
    vendorName: 'Green Grocery Mart',
    orderCount: 89,
    grossSales: 92000,
    commissionAmount: 9200,
    vendorPayout: 82800,
    period: 'This month',
  },
  {
    id: 'e3',
    vendorName: 'TechFix Hub',
    orderCount: 44,
    grossSales: 67500,
    commissionAmount: 5400,
    vendorPayout: 62100,
    period: 'This month',
  },
];

const MOCK_VENDOR_COMMISSION: VendorCommissionSummary = {
  rate: 10,
  totalSales: 248500,
  commissionDeducted: 24850,
  netEarnings: 223650,
  paymentHistory: [
    { id: 'p1', date: '2026-08-01', amount: 45000, status: 'paid', note: 'July payout' },
    { id: 'p2', date: '2026-07-01', amount: 38200, status: 'paid', note: 'June payout' },
    { id: 'p3', date: '2026-08-20', amount: 18600, status: 'pending', note: 'August mid-cycle' },
  ],
};

export const commissionService = {
  async listSettings(token?: string | null): Promise<CommissionSetting[]> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: Array<{
            id: number;
            rate: number;
            category_name?: string | null;
            business_name?: string | null;
          }>;
        }>('/admin/commissions', { token });
        if (res.data?.length) {
          return res.data.map((row) => ({
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
        }
      } catch {
        // fall through
      }
    }
    return MOCK_SETTINGS;
  },

  async updateRate(id: string, rate: number, token?: string | null): Promise<void> {
    if (token) {
      await apiRequest(`/admin/commissions/${id}`, {
        method: 'PATCH',
        token,
        body: { rate },
      });
    }
  },

  async getEarningsReport(token?: string | null): Promise<CommissionEarningRow[]> {
    void token;
    return MOCK_EARNINGS;
  },

  async getVendorCommission(token?: string | null): Promise<VendorCommissionSummary> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            revenue: number;
            commission: number;
            vendorAmount: number;
            commissionBreakdown?: { rate: number };
          };
        }>('/vendor/dashboard', { token });
        return {
          ...MOCK_VENDOR_COMMISSION,
          rate: res.data.commissionBreakdown?.rate ?? 10,
          totalSales: res.data.revenue,
          commissionDeducted: res.data.commission,
          netEarnings: res.data.vendorAmount,
        };
      } catch {
        // fall through
      }
    }
    return MOCK_VENDOR_COMMISSION;
  },
};
