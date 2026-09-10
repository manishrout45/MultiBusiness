'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { apiRequest } from '@/lib/api';

interface ContentReport {
  id: number;
  target_type: string;
  target_id: number;
  reason: string;
  details?: string | null;
  status: string;
  reporter_name?: string;
  created_at: string;
}

export function ContentReportsModeration() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiRequest<{ data: ContentReport[] }>('/admin/content-reports', {
        token,
      });
      setRows(res.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: number, status: string) {
    setBusyId(id);
    try {
      await apiRequest(`/admin/content-reports/${id}`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: 'Report updated', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading reports…</p>;
  if (!rows.length) {
    return (
      <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        No content reports yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {r.target_type} #{r.target_id}
            </Badge>
            <Badge className="capitalize">{r.status}</Badge>
            <span className="text-xs text-muted-foreground">
              by {r.reporter_name || 'User'} · {new Date(r.created_at).toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium">{r.reason}</p>
          {r.details && <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === r.id}
              onClick={() => void updateStatus(r.id, 'reviewing')}
            >
              Reviewing
            </Button>
            <Button
              size="sm"
              disabled={busyId === r.id}
              onClick={() => void updateStatus(r.id, 'resolved')}
            >
              Resolve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busyId === r.id}
              onClick={() => void updateStatus(r.id, 'dismissed')}
            >
              Dismiss
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
