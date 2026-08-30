import { apiRequest } from '@/lib/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  monthlyFee: number;
  yearlyFee: number;
  features: string[];
  maxProducts: number | null;
  highlighted?: boolean;
}

export interface CurrentSubscription {
  id: string;
  planId: string;
  planName: string;
  slug: string;
  monthlyFee: number;
  status: string;
  startDate: string;
  endDate: string;
  features: string[];
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic',
    slug: 'basic',
    monthlyFee: 499,
    yearlyFee: 4990,
    features: ['Digital storefront', 'Product listings', 'Business profile', 'Email support'],
    maxProducts: 50,
  },
  {
    id: '2',
    name: 'Standard',
    slug: 'standard',
    monthlyFee: 999,
    yearlyFee: 9990,
    features: [
      'Everything in Basic',
      'Analytics dashboard',
      'Marketing tools',
      'Priority support',
    ],
    maxProducts: 200,
    highlighted: true,
  },
  {
    id: '3',
    name: 'Premium',
    slug: 'premium',
    monthlyFee: 1999,
    yearlyFee: 19990,
    features: [
      'Everything in Standard',
      'Featured listing discount',
      'Advanced analytics',
      'Priority support',
    ],
    maxProducts: 500,
  },
  {
    id: '4',
    name: 'Enterprise',
    slug: 'enterprise',
    monthlyFee: 4999,
    yearlyFee: 49990,
    features: [
      'Everything in Premium',
      'Unlimited products',
      'Dedicated manager',
      'Custom integrations',
    ],
    maxProducts: null,
  },
];

function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [raw];
    } catch {
      return [raw];
    }
  }
  return [];
}

export const subscriptionService = {
  getDefaultPlans(): SubscriptionPlan[] {
    return DEFAULT_PLANS;
  },

  async listPlans(token?: string | null): Promise<SubscriptionPlan[]> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: Array<{
            id: number;
            name: string;
            slug: string;
            monthly_fee: number;
            yearly_fee: number;
            features: unknown;
            max_products?: number | null;
            is_active?: number;
          }>;
        }>('/vendor/memberships', { token });
        if (res.data?.length) {
          return res.data
            .filter((p) => p.is_active !== 0)
            .map((p) => ({
              id: String(p.id),
              name: p.name,
              slug: p.slug,
              monthlyFee: Number(p.monthly_fee),
              yearlyFee: Number(p.yearly_fee),
              features: parseFeatures(p.features),
              maxProducts: p.max_products ?? null,
              highlighted: p.slug === 'standard',
            }));
        }
      } catch {
        try {
          const adminRes = await apiRequest<{
            data: Array<{
              id: number;
              name: string;
              slug: string;
              monthly_fee: number;
              yearly_fee: number;
              features: unknown;
              max_products?: number | null;
            }>;
          }>('/admin/subscriptions', { token });
          if (adminRes.data?.length) {
            return adminRes.data.map((p) => ({
              id: String(p.id),
              name: p.name,
              slug: p.slug,
              monthlyFee: Number(p.monthly_fee),
              yearlyFee: Number(p.yearly_fee),
              features: parseFeatures(p.features),
              maxProducts: p.max_products ?? null,
              highlighted: p.slug === 'standard',
            }));
          }
        } catch {
          // fall through
        }
      }
    }
    return DEFAULT_PLANS;
  },

  async getCurrentSubscription(token?: string | null): Promise<CurrentSubscription | null> {
    if (token) {
      try {
        const res = await apiRequest<{
          data: {
            id: number;
            plan_id: number;
            plan_name: string;
            slug: string;
            monthly_fee: number;
            status: string;
            start_date: string;
            end_date: string;
            features?: unknown;
          } | null;
        }>('/vendor/subscription', { token });
        if (!res.data) return null;
        const d = res.data;
        return {
          id: String(d.id),
          planId: String(d.plan_id),
          planName: d.plan_name,
          slug: d.slug,
          monthlyFee: Number(d.monthly_fee),
          status: d.status,
          startDate: d.start_date,
          endDate: d.end_date,
          features: parseFeatures(d.features),
        };
      } catch {
        // fall through
      }
    }
    return {
      id: 'local-sub',
      planId: '1',
      planName: 'Basic',
      slug: 'basic',
      monthlyFee: 499,
      status: 'active',
      startDate: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      features: DEFAULT_PLANS[0].features,
    };
  },

  async subscribe(
    planId: string,
    billing: 'monthly' | 'yearly' = 'monthly',
    token?: string | null
  ): Promise<CurrentSubscription> {
    if (token) {
      const res = await apiRequest<{
        data: {
          id: number;
          plan_id: number;
          plan_name: string;
          monthly_fee: number;
          status: string;
          start_date: string;
          end_date: string;
        };
      }>('/vendor/subscription', {
        method: 'POST',
        token,
        body: { plan_id: Number(planId), billing },
      });
      const d = res.data;
      const plan = DEFAULT_PLANS.find((p) => p.id === planId);
      return {
        id: String(d.id),
        planId: String(d.plan_id),
        planName: d.plan_name,
        slug: plan?.slug ?? 'plan',
        monthlyFee: Number(d.monthly_fee),
        status: d.status,
        startDate: d.start_date,
        endDate: d.end_date,
        features: plan?.features ?? [],
      };
    }
    const plan = DEFAULT_PLANS.find((p) => p.id === planId) ?? DEFAULT_PLANS[0];
    return {
      id: `local-${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      slug: plan.slug,
      monthlyFee: plan.monthlyFee,
      status: 'active',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      features: plan.features,
    };
  },
};
