import { REVIEWS_STORAGE_KEY } from '@/lib/constants';
import { apiRequest, getApiBaseUrl } from '@/lib/api';

export interface Review {
  id: string;
  businessId: string;
  productId?: string | null;
  productName?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}

export interface SubmitReviewPayload {
  businessId: string;
  productId?: string;
  productName?: string;
  rating: number;
  comment: string;
  userName: string;
  photos?: File[];
}

function loadLocalReviews(businessId: string): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Review[]>) : {};
    return all[businessId] ?? [];
  } catch {
    return [];
  }
}

function saveLocalReview(businessId: string, review: Review): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Review[]>) : {};
    all[businessId] = [review, ...(all[businessId] ?? [])];
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export const reviewService = {
  async getReviews(businessId: string, slug?: string): Promise<{
    reviews: Review[];
    averageRating: number;
  }> {
    try {
      const qs = new URLSearchParams();
      if (slug) qs.set('slug', slug);
      else qs.set('businessId', businessId);
      const res = await apiRequest<{
        data: Array<{
          id: number;
          rating: number;
          comment?: string;
          created_at: string;
          user_name: string;
          product_id?: number;
          product_name?: string;
          images?: Array<{ file_path: string }>;
        }>;
        meta?: { averageRating: number; count: number };
      }>(`/reviews?${qs.toString()}`);

      const reviews = (res.data || []).map((r) => ({
        id: String(r.id),
        businessId,
        productId: r.product_id != null ? String(r.product_id) : null,
        productName: r.product_name,
        userName: r.user_name,
        rating: Number(r.rating),
        comment: r.comment || '',
        createdAt: r.created_at,
        images: (r.images || []).map((i) => i.file_path).filter(Boolean),
      }));

      const local = loadLocalReviews(businessId);
      const merged = [...local, ...reviews].filter(
        (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
      );
      return {
        reviews: merged,
        averageRating: res.meta?.averageRating ?? reviewService.averageRating(merged),
      };
    } catch {
      const local = loadLocalReviews(businessId);
      return { reviews: local, averageRating: reviewService.averageRating(local) };
    }
  },

  async submitReview(
    payload: SubmitReviewPayload,
    token?: string | null
  ): Promise<Review> {
    if (token) {
      const hasPhotos = Boolean(payload.photos?.length);
      if (hasPhotos) {
        const form = new FormData();
        form.append('businessId', payload.businessId);
        if (payload.productId) form.append('productId', payload.productId);
        form.append('rating', String(payload.rating));
        form.append('comment', payload.comment);
        for (const file of payload.photos || []) form.append('photos', file);

        const res = await fetch(`${getApiBaseUrl()}/customer/reviews`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          body: form,
        });
        const json = (await res.json()) as {
          message?: string;
          data?: {
            id: number;
            rating: number;
            comment: string;
            created_at: string;
            images?: Array<{ file_path: string }>;
          };
        };
        if (!res.ok) throw new Error(json.message || 'Review failed');
        const review: Review = {
          id: String(json.data?.id),
          businessId: payload.businessId,
          productId: payload.productId,
          productName: payload.productName,
          userName: payload.userName,
          rating: Number(json.data?.rating ?? payload.rating),
          comment: json.data?.comment ?? payload.comment,
          createdAt: json.data?.created_at || new Date().toISOString(),
          images: (json.data?.images || []).map((i) => i.file_path),
        };
        saveLocalReview(payload.businessId, review);
        return review;
      }

      const res = await apiRequest<{
        data: {
          id: number;
          rating: number;
          comment: string;
          created_at: string;
          images?: Array<{ file_path: string }>;
        };
      }>('/customer/reviews', {
        method: 'POST',
        token,
        body: {
          businessId: Number(payload.businessId),
          productId: payload.productId ? Number(payload.productId) : undefined,
          rating: payload.rating,
          comment: payload.comment,
        },
      });
      const review: Review = {
        id: String(res.data.id),
        businessId: payload.businessId,
        productId: payload.productId,
        productName: payload.productName,
        userName: payload.userName,
        rating: res.data.rating,
        comment: res.data.comment ?? payload.comment,
        createdAt: res.data.created_at,
        images: (res.data.images || []).map((i) => i.file_path),
      };
      saveLocalReview(payload.businessId, review);
      return review;
    }

    const review: Review = {
      id: `local-review-${Date.now()}`,
      businessId: payload.businessId,
      productId: payload.productId,
      productName: payload.productName,
      userName: payload.userName,
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      images: [],
    };
    saveLocalReview(payload.businessId, review);
    return review;
  },

  averageRating(reviews: Review[]): number {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },
};
