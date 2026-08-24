export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessCount: number;
}

export interface CategorySearchParams {
  query?: string;
  limit?: number;
}
