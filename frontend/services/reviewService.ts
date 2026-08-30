import { REVIEWS_STORAGE_KEY } from '@/lib/constants';
import { apiRequest } from '@/lib/api';

export interface Review {
  id: string;
  businessId: string;
  productId?: string | null;
  productName?: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SubmitReviewPayload {
  businessId: string;
  productId?: string;
  productName?: string;
  rating: number;
  comment: string;
  userName: string;
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
      try {
        const res = await apiRequest<{
          data: { id: number; rating: number; comment: string; created_at: string };
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
        };
        saveLocalReview(payload.businessId, review);
        return review;
      } catch {
        // fall through
      }
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
