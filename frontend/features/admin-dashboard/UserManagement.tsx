'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { dashboardService, type AdminUser } from '@/services/dashboardService';

export function UserManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<'all' | 'customer' | 'vendor'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const role = filter === 'all' ? undefined : filter;
    const data = await dashboardService.listUsers(token, role);
    setUsers(data);
    setIsLoading(false);
  }, [token, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleStatus(user: AdminUser) {
    const next = user.status === 'active' ? 'suspended' : 'active';
    setUpdatingId(user.id);
    try {
      await dashboardService.updateUserStatus(user.id, next, token);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
      toast({ title: `User ${next}`, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Card id="users" className="scroll-mt-24">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">User management</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(['all', 'customer', 'vendor'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'customer' ? 'Customers' : 'Vendors'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{user.name}</td>
                    <td className="py-3 text-muted-foreground">{user.email}</td>
                    <td className="py-3 capitalize">{user.role.replace('_', ' ')}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="capitalize">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === user.id}
                        onClick={() => void toggleStatus(user)}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
