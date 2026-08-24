'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { dashboardService, type AdminCategory } from '@/services/dashboardService';

export function CategoryManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setCategories(await dashboardService.listAdminCategories(token));
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
        { name: name.trim(), description: description.trim() || undefined },
        token
      );
      setCategories((prev) => [...prev, created]);
      setName('');
      setDescription('');
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
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={createCategory} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New category"
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
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">
              Create
            </Button>
          </div>
        </form>

        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : (
          <ul className="divide-y divide-border rounded-xl border">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{c.slug}
                    {c.description ? ` · ${c.description}` : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void remove(c.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
