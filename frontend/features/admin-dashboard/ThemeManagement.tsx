'use client';

import { useEffect, useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { usePlatformTheme } from '@/hooks/usePlatformTheme';
import { DEFAULT_BRAND_THEME, type BrandTheme } from '@/lib/applyBrandTheme';
import { normalizeHexColor } from '@/lib/categoryTheme';
import { FESTIVE_THEMES, type FestiveThemeId } from '@/lib/festiveThemes';
import { updatePlatformTheme } from '@/services/themeService';
import { cn } from '@/lib/utils';

export function ThemeManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = usePlatformTheme();
  const [draft, setDraft] = useState<BrandTheme>(theme);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(theme);
  }, [theme]);

  function updateDraft(partial: Partial<BrandTheme>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    setTheme(next);
  }

  async function save() {
    setBusy(true);
    try {
      const saved = await updatePlatformTheme(
        {
          primary: normalizeHexColor(draft.primary),
          secondary: normalizeHexColor(draft.secondary),
          light: normalizeHexColor(draft.light),
          festiveTheme: draft.festiveTheme,
        },
        token
      );
      setDraft(saved);
      setTheme(saved);
      toast({ title: 'Theme saved', description: 'Brand and festive theme are live for all users.', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Could not save theme',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  function resetBrand() {
    updateDraft({
      primary: DEFAULT_BRAND_THEME.primary,
      secondary: DEFAULT_BRAND_THEME.secondary,
      light: DEFAULT_BRAND_THEME.light,
    });
  }

  return (
    <Card id="theme" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="size-4 text-primary" />
          Theme
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Change marketplace colors and switch festive animated themes for events.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Brand colors</h3>
          <div
            className="h-16 rounded-2xl shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${draft.primary}, ${draft.secondary})`,
            }}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorField
              id="theme-primary"
              label="Primary"
              hint="#484AAA"
              value={draft.primary}
              onChange={(primary) => updateDraft({ primary })}
            />
            <ColorField
              id="theme-secondary"
              label="Gradient / secondary"
              hint="#9791F1"
              value={draft.secondary}
              onChange={(secondary) => updateDraft({ secondary })}
            />
            <ColorField
              id="theme-light"
              label="Light surfaces"
              hint="#F7EBF9"
              value={draft.light}
              onChange={(light) => updateDraft({ light })}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={resetBrand}>
            Reset to default gradient
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Festive & event themes</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Animated elements appear site-wide for shoppers. Pick one for Diwali, New Year, and other occasions.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FESTIVE_THEMES.map((item) => {
              const active = draft.festiveTheme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateDraft({ festiveTheme: item.id as FestiveThemeId })}
                  className={cn(
                    'rounded-2xl border p-3 text-left transition',
                    active
                      ? 'border-primary bg-light shadow-sm ring-2 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <FestivePreview id={item.id} />
                  <p className="mt-2 text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                    {item.season}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" disabled={busy} onClick={() => void save()}>
            {busy ? 'Saving…' : 'Save theme'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={normalizeHexColor(value)}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase"
          maxLength={7}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">Default {hint}</p>
    </div>
  );
}

function FestivePreview({ id }: { id: FestiveThemeId }) {
  const tones: Record<FestiveThemeId, string> = {
    none: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
    diwali: 'linear-gradient(135deg, #F59E0B, #DC2626)',
    newyear: 'linear-gradient(135deg, #484AAA, #FBBF24)',
    holi: 'linear-gradient(90deg, #EF4444, #F59E0B, #22C55E, #3B82F6, #A855F7)',
    christmas: 'linear-gradient(135deg, #166534, #DC2626)',
    eid: 'linear-gradient(135deg, #0F766E, #FBBF24)',
    independence: 'linear-gradient(90deg, #F97316, #FFFFFF, #16A34A)',
    valentine: 'linear-gradient(135deg, #E11D48, #FB7185)',
  };

  return <div className="h-10 rounded-xl" style={{ background: tones[id] }} />;
}
