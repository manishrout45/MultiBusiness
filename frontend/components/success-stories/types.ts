export interface SuccessStoryStat {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export interface SuccessStoriesData {
  stats: SuccessStoryStat[];
  updatedAt: string;
}

export const DEFAULT_SUCCESS_STORIES: SuccessStoriesData = {
  updatedAt: new Date().toISOString(),
  stats: [
    { id: 'businesses', value: '10,000+', label: 'Businesses Joined' },
    { id: 'products', value: '50,000+', label: 'Products Listed' },
    { id: 'orders', value: '15M+', label: 'Orders Delivered' },
    { id: 'rating', value: '4.8/5', label: 'Customer Rating' },
    { id: 'cities', value: '500+', label: 'Cities Covered' },
  ],
};
