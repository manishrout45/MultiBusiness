import { hexToHsl, normalizeHexColor } from '@/lib/categoryTheme';
import { colors } from '@/lib/theme';
import type { FestiveThemeId } from '@/lib/festiveThemes';
import { isFestiveThemeId } from '@/lib/festiveThemes';

export interface BrandTheme {
  primary: string;
  secondary: string;
  light: string;
  festiveTheme: FestiveThemeId;
}

export const DEFAULT_BRAND_THEME: BrandTheme = {
  primary: colors.primary,
  secondary: colors.secondary,
  light: colors.light,
  festiveTheme: 'none',
};

function hslParts(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  return `${h} ${s}% ${l}%`;
}

/** Apply brand colors as CSS variables on :root so the whole app updates. */
export function applyBrandTheme(theme: BrandTheme) {
  if (typeof document === 'undefined') return;
  const primary = normalizeHexColor(theme.primary);
  const secondary = normalizeHexColor(theme.secondary);
  const light = normalizeHexColor(theme.light);
  const root = document.documentElement;

  root.style.setProperty('--primary', hslParts(primary));
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--secondary', hslParts(secondary));
  root.style.setProperty('--secondary-foreground', hslParts(primary));
  root.style.setProperty('--light', hslParts(light));
  root.style.setProperty('--accent', hslParts(light));
  root.style.setProperty('--accent-foreground', hslParts(primary));
  root.style.setProperty('--muted', hslParts(light));
  root.style.setProperty('--ring', hslParts(primary));
  root.style.setProperty('--brand-from', primary);
  root.style.setProperty('--brand-to', secondary);
  root.style.setProperty('--brand-light', light);

  const festive = isFestiveThemeId(theme.festiveTheme) ? theme.festiveTheme : 'none';
  if (festive === 'none') root.removeAttribute('data-festive');
  else root.setAttribute('data-festive', festive);
}

export function parseBrandTheme(raw: Record<string, string | undefined>): BrandTheme {
  const festive = raw.festive_theme ?? raw.festiveTheme ?? 'none';
  return {
    primary: normalizeHexColor(raw.theme_primary ?? raw.primary ?? DEFAULT_BRAND_THEME.primary),
    secondary: normalizeHexColor(
      raw.theme_secondary ?? raw.secondary ?? DEFAULT_BRAND_THEME.secondary
    ),
    light: normalizeHexColor(raw.theme_light ?? raw.light ?? DEFAULT_BRAND_THEME.light),
    festiveTheme: isFestiveThemeId(festive) ? festive : 'none',
  };
}
