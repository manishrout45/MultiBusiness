import { apiRequest } from '@/lib/api';

export interface VendorDashboardStats {
  products: number;
  activeProducts: number;
  outOfStock: number;
  orders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
  totalSales: number;
  customers: number;
  reviews: number;
  commission: number;
  vendorAmount: number;
  commissionRate: number;
}

export interface CustomerLead {
  id: string;
  customerName: string;
  contact: string;
  productInquiry: string;
  date: string;
}

export interface AdminDashboardStats {
  users: number;
  customers: number;
  vendors: number;
  products: number;
  pendingProducts: number;
  publishedProducts: number;
  orders: number;
  ordersByStatus: Record<string, number>;
  revenue: number;
  commissions: number;
  reviews: number;
  pendingReviews: number;
  categories: number;
  businesses: {
    pending: number;
    recommended: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt?: string;
}

export interface PendingVendor {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  categoryName?: string;
  city?: string;
  address?: string | null;
  status: string;
  createdAt: string;
  documentsVerified?: boolean;
  productCount?: number;
  pendingProductCount?: number;
  publishedProductCount?: number;
  description?: string | null;
}

export interface VendorProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  status: string;
  stock: number;
}

export interface VendorDetails extends PendingVendor {
  products: VendorProduct[];
}

function mapVendorRow(b: {
  id: number;
  business_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  category_name?: string;
  city?: string;
  address?: string;
  description?: string;
  status: string;
  created_at: string;
  is_verified?: number;
  product_count?: number;
  pending_product_count?: number;
  published_product_count?: number;
}): PendingVendor {
  return {
    id: String(b.id),
    businessName: b.business_name,
    ownerName: b.owner_name,
    ownerEmail: b.owner_email,
    ownerPhone: b.owner_phone,
    categoryName: b.category_name,
    city: b.city,
    address: b.address,
    description: b.description,
    status: b.status,
    createdAt: b.created_at,
    documentsVerified: Boolean(b.is_verified),
    productCount: Number(b.product_count ?? 0),
    pendingProductCount: Number(b.pending_product_count ?? 0),
    publishedProductCount: Number(b.published_product_count ?? 0),
  };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  themeColor?: string;
  isActive?: boolean | number;
  parentId?: number | null;
}

const MOCK_VENDOR_STATS: VendorDashboardStats = {
  products: 24,
  activeProducts: 18,
  outOfStock: 3,
  orders: 156,
  pendingOrders: 8,
  processingOrders: 12,
  completedOrders: 130,
  cancelledOrders: 6,
  revenue: 248500,
  totalSales: 248500,
  customers: 89,
  reviews: 42,
  commission: 24850,
  vendorAmount: 223650,
  commissionRate: 10,
};

const MOCK_LEADS: CustomerLead[] = [
  {
    id: '1',
    customerName: 'Priya Sharma',
    contact: 'priya@email.com',
    productInquiry: 'Wireless earbuds — bulk order',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    customerName: 'Rahul Mehta',
    contact: '+91 98765 43210',
    productInquiry: 'Smart watch availability',
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    customerName: 'Ananya Gupta',
    contact: 'ananya@email.com',
    productInquiry: 'Phone case for iPhone 15',
    date: new Date(Date.now() - 259200000).toISOString(),
  },
];

const MOCK_ADMIN_STATS: AdminDashboardStats = {
  users: 1240,
  customers: 980,
  vendors: 186,
  products: 4520,
  pendingProducts: 18,
  publishedProducts: 4200,
  orders: 8930,
  ordersByStatus: { pending: 42, processing: 88, shipped: 120, delivered: 8500, cancelled: 180 },
  revenue: 4250000,
  commissions: 425000,
  reviews: 420,
  pendingReviews: 12,
  categories: 28,
  businesses: {
    pending: 12,
    recommended: 4,
    approved: 160,
    rejected: 8,
    suspended: 2,
  },
};

export const dashboardService = {
  async getVendorDashboard(token?: string | null): Promise<VendorDashboardStats> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            products: number;
            orders: number;
            pendingOrders: number;
            revenue: number;
            commission: number;
            vendorAmount: number;
            commissionBreakdown?: { rate: number };
          };
        }>('/vendor/dashboard', { token });
        const d = res.data;
        return {
          ...MOCK_VENDOR_STATS,
          products: d.products,
          orders: d.orders,
          pendingOrders: d.pendingOrders,
          revenue: d.revenue,
          totalSales: d.revenue,
          commission: d.commission,
          vendorAmount: d.vendorAmount,
          commissionRate: d.commissionBreakdown?.rate ?? 10,
          activeProducts: Math.max(0, d.products - MOCK_VENDOR_STATS.outOfStock),
        };
      } catch {
        // fall through
      }
    }
    return MOCK_VENDOR_STATS;
  },

  async getVendorLeads(token?: string | null): Promise<CustomerLead[]> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: Array<{
            id: number;
            visitor_name?: string;
            visitor_email?: string;
            product_name?: string;
            visited_at: string;
          }>;
        }>('/vendor/leads', { token });
        if (res.data?.length) {
          return res.data.map((row) => ({
            id: String(row.id),
            customerName: row.visitor_name || 'Guest visitor',
            contact: row.visitor_email || '—',
            productInquiry: row.product_name || 'Product view',
            date: row.visited_at,
          }));
        }
      } catch {
        // fall through
      }
    }
    return MOCK_LEADS;
  },

  async getAdminDashboard(token?: string | null): Promise<AdminDashboardStats> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            users: number;
            customers?: number;
            vendors?: number;
            businesses: AdminDashboardStats['businesses'];
            products: number;
            pendingProducts?: number;
            publishedProducts?: number;
            orders: number;
            ordersByStatus?: Record<string, number>;
            revenue: number;
            commissions: number;
            reviews?: number;
            pendingReviews?: number;
            categories?: number;
          };
        }>('/admin/dashboard', { token });
        const d = res.data;
        return {
          users: d.users,
          customers: d.customers ?? Math.max(0, d.users - (d.businesses.approved || 0)),
          vendors: d.vendors ?? (d.businesses.approved || 0),
          products: d.products,
          pendingProducts: d.pendingProducts ?? 0,
          publishedProducts: d.publishedProducts ?? 0,
          orders: d.orders,
          ordersByStatus: d.ordersByStatus ?? {},
          revenue: d.revenue,
          commissions: d.commissions,
          reviews: d.reviews ?? 0,
          pendingReviews: d.pendingReviews ?? 0,
          categories: d.categories ?? 0,
          businesses: d.businesses,
        };
      } catch {
        // fall through
      }
    }
    return MOCK_ADMIN_STATS;
  },

  async listUsers(token?: string | null, role?: string): Promise<AdminUser[]> {
    if (token) {
      try {
        const q = role ? `?role=${encodeURIComponent(role)}` : '';
        const res = await apiRequest<{
          data: Array<{
            id: number;
            name: string;
            email: string;
            phone?: string;
            role: string;
            status: string;
            created_at?: string;
          }>;
        }>(`/admin/users${q}`, { token });
        return res.data.map((u) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          createdAt: u.created_at,
        }));
      } catch {
        // fall through
      }
    }
    return [
      { id: '1', name: 'Demo Customer', email: 'customer@marketplace.com', role: 'customer', status: 'active' },
      { id: '2', name: 'Demo Vendor', email: 'vendor@marketplace.com', role: 'vendor', status: 'active' },
      { id: '3', name: 'Priya S.', email: 'priya@email.com', role: 'customer', status: 'active' },
      { id: '4', name: 'Rahul M.', email: 'rahul@email.com', role: 'vendor', status: 'suspended' },
    ];
  },

  async updateUserStatus(
    userId: string,
    status: string,
    token?: string | null
  ): Promise<void> {
    if (token) {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
    }
  },

  async listPendingVendors(token?: string | null): Promise<PendingVendor[]> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: Array<{
            id: number;
            business_name: string;
            owner_name: string;
            owner_email: string;
            owner_phone?: string;
            category_name?: string;
            city?: string;
            address?: string;
            description?: string;
            status: string;
            created_at: string;
            is_verified?: number;
            product_count?: number;
            pending_product_count?: number;
            published_product_count?: number;
          }>;
        }>('/admin/businesses/pending', { token });
        return res.data.map(mapVendorRow);
      } catch {
        // fall through
      }
    }
    return [
      {
        id: '101',
        businessName: 'Green Grocery Mart',
        ownerName: 'Suresh Patel',
        ownerEmail: 'suresh@green.com',
        categoryName: 'Retail',
        city: 'Bhubaneswar',
        status: 'pending',
        createdAt: new Date().toISOString(),
        documentsVerified: false,
        productCount: 0,
        pendingProductCount: 0,
        publishedProductCount: 0,
      },
      {
        id: '102',
        businessName: 'TechFix Hub',
        ownerName: 'Meena Das',
        ownerEmail: 'meena@techfix.com',
        categoryName: 'Electronics',
        city: 'Cuttack',
        status: 'recommended',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        documentsVerified: true,
        productCount: 3,
        pendingProductCount: 1,
        publishedProductCount: 2,
      },
    ];
  },

  async listAllVendors(token?: string | null, status?: string): Promise<PendingVendor[]> {
    if (token) {
      try {
        const q = status ? `?status=${encodeURIComponent(status)}` : '';
        const res = await apiRequest<{
          data: Array<{
            id: number;
            business_name: string;
            owner_name: string;
            owner_email: string;
            owner_phone?: string;
            category_name?: string;
            city?: string;
            address?: string;
            description?: string;
            status: string;
            created_at: string;
            is_verified?: number;
            product_count?: number;
            pending_product_count?: number;
            published_product_count?: number;
          }>;
        }>(`/admin/vendors${q}`, { token });
        return (res.data || []).map(mapVendorRow);
      } catch {
        // fall through
      }
    }
    return this.listPendingVendors(token);
  },

  async getVendorDetails(id: string, token?: string | null): Promise<VendorDetails | null> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            id: number;
            business_name: string;
            owner_name: string;
            owner_email: string;
            owner_phone?: string;
            category_name?: string;
            city?: string;
            address?: string;
            description?: string;
            status: string;
            created_at: string;
            is_verified?: number;
            products?: Array<{
              id: number;
              name: string;
              description?: string;
              price?: number;
              status: string;
              stock?: number;
            }>;
          };
        }>(`/admin/vendors/${id}`, { token });
        const v = mapVendorRow(res.data);
        return {
          ...v,
          products: (res.data.products || []).map((p) => ({
            id: String(p.id),
            name: p.name,
            description: p.description || null,
            price: Number(p.price ?? 0),
            status: p.status,
            stock: Number(p.stock ?? 0),
          })),
        };
      } catch {
        return null;
      }
    }
    return null;
  },

  async approveVendor(id: string, token?: string | null): Promise<void> {
    if (token) {
      await apiRequest(`/admin/businesses/${id}/approve`, { method: 'PATCH', token });
    }
  },

  async rejectVendor(id: string, reason: string, token?: string | null): Promise<void> {
    if (token) {
      await apiRequest(`/admin/businesses/${id}/reject`, {
        method: 'PATCH',
        token,
        body: { reason },
      });
    }
  },

  async verifyVendor(id: string, token?: string | null): Promise<void> {
    if (token) {
      await apiRequest(`/admin/businesses/${id}/verify`, {
        method: 'PATCH',
        token,
        body: { isVerified: true },
      });
    }
  },

  async listAdminCategories(token?: string | null): Promise<AdminCategory[]> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: Array<{
            id: number;
            name: string;
            slug: string;
            description?: string;
            theme_color?: string;
            is_active?: number;
            parent_id?: number | null;
          }>;
        }>('/admin/categories', { token });
        return res.data.map((c) => ({
          id: String(c.id),
          name: c.name,
          slug: c.slug,
          description: c.description,
          themeColor: c.theme_color ? String(c.theme_color) : '#484AAA',
          isActive: c.is_active,
          parentId: c.parent_id,
        }));
      } catch {
        // fall through
      }
    }
    return [
      { id: '1', name: 'Retail Store', slug: 'retail-store', description: 'General retail', themeColor: '#484AAA', isActive: 1 },
      { id: '2', name: 'Electronics', slug: 'electronics', description: 'Gadgets', themeColor: '#2563EB', isActive: 1 },
      { id: '3', name: 'Restaurant', slug: 'restaurant', description: 'Food & dining', themeColor: '#EA580C', isActive: 1 },
    ];
  },

  async createCategory(
    input: { name: string; description?: string; themeColor?: string },
    token?: string | null
  ): Promise<AdminCategory> {
    if (token) {
      const res = await apiRequest<{
        data: { id: number; name: string; slug: string; description?: string; theme_color?: string };
      }>('/admin/categories', {
        method: 'POST',
        token,
        body: {
          name: input.name,
          description: input.description,
          theme_color: input.themeColor,
        },
      });
      return {
        id: String(res.data.id),
        name: res.data.name,
        slug: res.data.slug,
        description: res.data.description,
        themeColor: res.data.theme_color ?? input.themeColor ?? '#484AAA',
        isActive: 1,
      };
    }
    return {
      id: `local-${Date.now()}`,
      name: input.name,
      slug: input.name.toLowerCase().replace(/\s+/g, '-'),
      description: input.description,
      themeColor: input.themeColor ?? '#484AAA',
      isActive: 1,
    };
  },

  async updateCategory(
    id: string,
    input: { name?: string; description?: string; themeColor?: string },
    token?: string | null
  ): Promise<void> {
    if (token) {
      await apiRequest(`/admin/categories/${id}`, {
        method: 'PATCH',
        token,
        body: {
          name: input.name,
          description: input.description,
          theme_color: input.themeColor,
        },
      });
    }
  },

  async deleteCategory(id: string, token?: string | null): Promise<void> {
    if (token) {
      await apiRequest(`/admin/categories/${id}`, { method: 'DELETE', token });
    }
  },

  async listAdminProducts(
    token?: string | null,
    status?: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      businessName: string;
      price: number;
      status: string;
      stock: number;
    }>
  > {
    if (token) {
      try {
        const q = status ? `?status=${encodeURIComponent(status)}` : '';
        const res = await apiRequest<{
          data: Array<{
            id: number;
            name: string;
            business_name?: string;
            price?: number;
            status: string;
            stock?: number;
            stock_quantity?: number;
          }>;
        }>(`/admin/products${q}`, { token });
        return (res.data || []).map((p) => ({
          id: String(p.id),
          name: p.name,
          businessName: p.business_name || 'Vendor',
          price: Number(p.price ?? 0),
          status: p.status,
          stock: Number(p.stock ?? p.stock_quantity ?? 0),
        }));
      } catch {
        // fall through
      }
    }
    return [];
  },

  async updateProductStatus(
    id: string,
    status: string,
    token?: string | null
  ): Promise<void> {
    if (token) {
      await apiRequest(`/admin/products/${id}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
    }
  },

  async removeProduct(id: string, token?: string | null): Promise<void> {
    if (token) {
      await apiRequest(`/admin/products/${id}`, { method: 'DELETE', token });
    }
  },
};
