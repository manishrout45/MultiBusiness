import type { CSSProperties } from 'react';
import { colors } from '@/lib/theme';

export const DEFAULT_CATEGORY_THEME = colors.primary;

const HEX_RE = /^#([0-9A-Fa-f]{6})$/;

export function isValidHexColor(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function normalizeHexColor(value: string | null | undefined): string {
  if (!value) return DEFAULT_CATEGORY_THEME;
  const v = value.trim();
  if (isValidHexColor(v)) return v.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v.toUpperCase()}`;
  return DEFAULT_CATEGORY_THEME;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getCategoryThemeVars(hex: string): Record<string, string> {
  const { h, s, l } = hexToHsl(hex);
  const softL = Math.min(96, l + 42);
  const borderL = Math.min(88, l + 28);
  return {
    '--category-theme': `${h} ${s}% ${l}%`,
    '--category-theme-foreground': l > 55 ? '222 47% 11%' : '0 0% 100%',
    '--category-theme-soft': `${h} ${Math.max(20, s - 10)}% ${softL}%`,
    '--category-theme-border': `${h} ${Math.max(15, s - 15)}% ${borderL}%`,
  };
}

export function categoryThemeStyle(hex: string): CSSProperties {
  return getCategoryThemeVars(hex) as CSSProperties;
}
