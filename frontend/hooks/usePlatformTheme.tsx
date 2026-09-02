'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyBrandTheme, DEFAULT_BRAND_THEME, type BrandTheme } from '@/lib/applyBrandTheme';
import { fetchPublicTheme } from '@/services/themeService';

interface PlatformThemeContextValue {
  theme: BrandTheme;
  setTheme: (theme: BrandTheme) => void;
  refresh: () => Promise<void>;
}

const PlatformThemeContext = createContext<PlatformThemeContextValue | null>(null);

export function PlatformThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BrandTheme>(DEFAULT_BRAND_THEME);

  function setTheme(next: BrandTheme) {
    setThemeState(next);
    applyBrandTheme(next);
  }

  async function refresh() {
    const loaded = await fetchPublicTheme();
    setTheme(loaded);
  }

  useEffect(() => {
    applyBrandTheme(DEFAULT_BRAND_THEME);
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ theme, setTheme, refresh }), [theme]);

  return (
    <PlatformThemeContext.Provider value={value}>{children}</PlatformThemeContext.Provider>
  );
}

export function usePlatformTheme() {
  const ctx = useContext(PlatformThemeContext);
  if (!ctx) {
    throw new Error('usePlatformTheme must be used within PlatformThemeProvider');
  }
  return ctx;
}
