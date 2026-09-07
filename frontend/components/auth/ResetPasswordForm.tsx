'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PasswordField } from '@/components/auth/PasswordField';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { resetPasswordRequest } from '@/services/authService';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing or invalid. Request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setPending(true);
    try {
      await resetPasswordRequest(token, password);
      router.push('/login?reset=1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update password');
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          This reset link is invalid. Request a new password reset.
        </p>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="underline underline-offset-2">
            Send a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordField
        id="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        minLength={6}
        placeholder="New password (at least 6 characters)"
      />
      <PasswordField
        id="confirmPassword"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        minLength={6}
        placeholder="Confirm new password"
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" />
            Updating…
          </>
        ) : (
          'Update password'
        )}
      </Button>
    </form>
  );
}
