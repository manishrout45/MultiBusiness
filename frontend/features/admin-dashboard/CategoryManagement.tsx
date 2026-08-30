'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { DEFAULT_CATEGORY_THEME, normalizeHexColor } from '@/lib/categoryTheme';
import { dashboardService, type AdminCategory } from '@/services/dashboardService';

export function CategoryManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState(DEFAULT_CATEGORY_THEME);
  const [draftColors, setDraftColors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    const rows = await dashboardService.listAdminCategories(token);
    setCategories(rows);
    setDraftColors(
      Object.fromEntries(rows.map((c) => [c.id, c.themeColor ?? DEFAULT_CATEGORY_THEME]))
    );
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const created = await dashboardService.createCategory(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          themeColor: normalizeHexColor(themeColor),
        },
        token
      );
      setCategories((prev) => [...prev, created]);
      setDraftColors((prev) => ({ ...prev, [created.id]: created.themeColor ?? themeColor }));
      setName('');
      setDescription('');
      setThemeColor(DEFAULT_CATEGORY_THEME);
      toast({ title: 'Category created', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Create failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveColor(id: string) {
    const color = normalizeHexColor(draftColors[id]);
    setBusy(true);
    try {
      await dashboardService.updateCategory(id, { themeColor: color }, token);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, themeColor: color } : c))
      );
      toast({ title: 'Category color saved', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await dashboardService.deleteCategory(id, token);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Category deleted', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card id="categories" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-base">Category management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign a theme color per category. Colors appear on category icons and category pages.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={createCategory}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Grocery Store"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Input
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-color">Theme color</Label>
            <div className="flex items-center gap-2">
              <input
                id="cat-color"
                type="color"
                value={normalizeHexColor(themeColor)}
                onChange={(e) => setThemeColor(e.target.value)}
                className="size-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
              />
              <Input
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-24 font-mono text-xs uppercase"
                maxLength={7}
              />
            </div>
          </div>
          <div className="flex items-end sm:col-span-2">
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              Create
            </Button>
          </div>
        </form>

        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : (
          <ul className="divide-y divide-border rounded-xl border">
            {categories.map((c) => {
              const draft = draftColors[c.id] ?? c.themeColor ?? DEFAULT_CATEGORY_THEME;
              const dirty = normalizeHexColor(draft) !== normalizeHexColor(c.themeColor);
              return (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold text-white"
                      style={{ backgroundColor: normalizeHexColor(draft), borderColor: draft }}
                    >
                      {c.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        /{c.slug}
                        {c.description ? ` · ${c.description}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      value={normalizeHexColor(draft)}
                      onChange={(e) =>
                        setDraftColors((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="size-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                      aria-label={`Color for ${c.name}`}
                    />
                    <Input
                      value={draft}
                      onChange={(e) =>
                        setDraftColors((prev) => ({ ...prev, [c.id]: e.target.value }))
                      }
                      className="h-9 w-24 font-mono text-xs uppercase"
                      maxLength={7}
                    />
                    <Button
                      size="sm"
                      variant={dirty ? 'primary' : 'outline'}
                      disabled={busy || !dirty}
                      onClick={() => void saveColor(c.id)}
                    >
                      Save color
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void remove(c.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
