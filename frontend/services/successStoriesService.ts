import { API_BASE_URL } from '@/lib/constants';
import {
  DEFAULT_SUCCESS_STORIES,
  type SuccessStoriesData,
} from '@/components/success-stories';

/** Fetch platform success metrics — falls back to defaults for demo / offline */
export async function fetchSuccessStories(): Promise<SuccessStoriesData> {
  try {
    const res = await fetch(`${API_BASE_URL}/platform/success-stories`);
    if (!res.ok) return DEFAULT_SUCCESS_STORIES;
    const data = (await res.json()) as { data?: SuccessStoriesData };
    if (data?.data?.stats?.length) return data.data;
    return DEFAULT_SUCCESS_STORIES;
  } catch {
    return DEFAULT_SUCCESS_STORIES;
  }
}

export { DEFAULT_SUCCESS_STORIES };
