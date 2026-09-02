/**
 * Central design tokens — change these values (and matching CSS vars in globals.css)
 * to retheme the entire application. Prefer Tailwind classes: bg-primary, text-success, etc.
 *
 * Brand gradient: primary → secondary
 * Light surfaces: light
 */
export const colors = {
  /** Brand / primary actions — #484AAA */
  primary: '#484AAA',
  /** Gradient end / accent — #9791F1 */
  secondary: '#9791F1',
  success: '#0B8F55',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  /** Soft surfaces — #F7EBF9 */
  light: '#F7EBF9',
  dark: '#0F172A',
} as const;

export type ThemeColor = keyof typeof colors;

/** Configurable search radii (km) used by RadiusSelector and discovery map. */
export const SEARCH_RADIUS_OPTIONS_KM = [1, 2, 5, 10, 15, 25, 50] as const;

export type SearchRadiusKm = (typeof SEARCH_RADIUS_OPTIONS_KM)[number];

export const DEFAULT_SEARCH_RADIUS_KM: SearchRadiusKm = 5;

export const PRODUCT_ROTATION_MS = 5 * 60 * 1000;
