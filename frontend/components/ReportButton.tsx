'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { apiRequest } from '@/lib/api';

interface ReportButtonProps {
  targetType: 'product' | 'business' | 'user' | 'review';
  targetId: string | number;
  label?: string;
}

export function ReportButton({ targetType, targetId, label = 'Report' }: ReportButtonProps) {
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Inappropriate content');
  const [details, setDetails] = useState('');
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!isAuthenticated || !token) {
      toast({ title: 'Sign in required', description: 'Sign in to submit a report.', variant: 'error' });
      return;
    }
    setPending(true);
    try {
      await apiRequest('/customer/reports', {
        method: 'POST',
        token,
        body: {
          targetType,
          targetId: Number(targetId),
          reason,
          details: details.trim() || undefined,
        },
      });
      toast({ title: 'Report sent', description: 'Our team will review it.', variant: 'success' });
      setOpen(false);
      setDetails('');
    } catch (err) {
      toast({
        title: 'Report failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'error',
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(true)}>
        <Flag className="size-4" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {targetType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Reason</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option>Inappropriate content</option>
                <option>Spam or scam</option>
                <option>Fake listing</option>
                <option>Harassment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Details (optional)</Label>
              <Textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={pending}>
              {pending ? 'Sending…' : 'Submit report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
