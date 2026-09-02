import { apiRequest } from '@/lib/api';
import {
  applyBrandTheme,
  DEFAULT_BRAND_THEME,
  parseBrandTheme,
  type BrandTheme,
} from '@/lib/applyBrandTheme';

export type { BrandTheme };

export async function fetchPublicTheme(): Promise<BrandTheme> {
  try {
    const res = await apiRequest<{ data: Record<string, string> }>('/theme');
    const data = res.data || {};
    return parseBrandTheme({
      theme_primary: data.primary,
      theme_secondary: data.secondary,
      theme_light: data.light,
      festive_theme: data.festiveTheme,
    });
  } catch {
    return { ...DEFAULT_BRAND_THEME };
  }
}

export async function updatePlatformTheme(
  theme: BrandTheme,
  token?: string | null
): Promise<BrandTheme> {
  const res = await apiRequest<{ data: Record<string, string> }>('/admin/theme', {
    method: 'PATCH',
    token,
    body: {
      primary: theme.primary,
      secondary: theme.secondary,
      light: theme.light,
      festiveTheme: theme.festiveTheme,
    },
  });
  const data = res.data || {};
  const next = parseBrandTheme({
    theme_primary: data.primary,
    theme_secondary: data.secondary,
    theme_light: data.light,
    festive_theme: data.festiveTheme,
  });
  applyBrandTheme(next);
  return next;
}
