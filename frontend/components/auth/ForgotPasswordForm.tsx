'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/lib/api';
import { forgotPasswordRequest } from '@/services/authService';

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setShowCreateAccount(false);
    setPending(true);
    try {
      const result = await forgotPasswordRequest(email.trim());
      setSent(true);
      setResetUrl(result.resetUrl || null);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ACCOUNT_NOT_FOUND') {
        setShowCreateAccount(true);
        setError(err.message);
      } else if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        setError(err instanceof ApiError ? err.message : 'Unable to send reset link');
      }
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password reset link sent to your email.
        </p>
        {resetUrl && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Email is not configured locally.{' '}
            <a href={resetUrl} className="font-medium underline underline-offset-2">
              Open reset link
            </a>
          </p>
        )}
        <p className="text-center text-sm text-neutral-600">
          <Link
            href={`/login?email=${encodeURIComponent(email.trim())}`}
            className="underline underline-offset-2"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-primary"
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {showCreateAccount && (
        <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          <Link
            href={`/register?email=${encodeURIComponent(email.trim())}`}
            className="font-medium underline underline-offset-2"
          >
            Create an account
          </Link>{' '}
          first, then you can reset your password after signing up.
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" />
            Sending…
          </>
        ) : (
          'Send reset link'
        )}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-neutral-950 underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  );
}
