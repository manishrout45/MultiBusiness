export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  location: string;
  city: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  coverUrl?: string;
  featured: boolean;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: string;
  directionsUrl?: string;
  embedUrl?: string;
  gallery?: BusinessGalleryItem[];
}

export interface BusinessGalleryItem {
  id: string | number;
  file_path?: string;
  url?: string;
  media_type?: string;
  caption?: string | null;
}

export interface BusinessProduct {
  id: string | number;
  name: string;
  description?: string | null;
  price: number;
  sale_price?: number | null;
  stock?: number;
  status?: string;
  images?: { file_path?: string }[];
}

export interface BusinessDetail extends Business {
  products?: BusinessProduct[];
}

export interface BusinessSearchParams {
  query?: string;
  category?: string;
  categoryId?: string | number;
  city?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface BusinessListResponse {
  data: Business[];
  total: number;
  page: number;
  limit: number;
  source: 'api' | 'fallback';
}

/** Raw row shape from Express / MySQL businesses table */
export interface ApiBusinessRow {
  id: number | string;
  business_name?: string;
  name?: string;
  business_type?: string;
  category_id?: number | null;
  category_name?: string;
  description?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  address?: string;
  city?: string;
  state?: string | null;
  phone?: string;
  email?: string | null;
  website?: string | null;
  is_featured?: number | boolean;
  status?: string;
  avg_rating?: number | string | null;
  review_count?: number | string | null;
  gallery?: BusinessGalleryItem[];
  directionsUrl?: string;
  embedUrl?: string;
  slug?: string;
}
