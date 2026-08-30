'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthSocialOptions } from '@/components/auth/AuthSocialOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';
import { APP_NAME } from '@/lib/constants';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onContinueEmail = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Enter your email address');
      return;
    }
    setStep('password');
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email: email.trim(), password });
      const next = searchParams.get('next') || '/';
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn('space-y-5', className)}>
      {step === 'email' ? (
        <form onSubmit={onContinueEmail} className="space-y-4">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-neutral-900"
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continue with email
          </Button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setError(null);
              setPassword('');
            }}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← {email}
          </button>

          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-neutral-900"
            autoFocus
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
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
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      )}

      <AuthSocialOptions />

      <p className="pt-1 text-center text-sm text-neutral-600">
        New to {APP_NAME}?{' '}
        <Link href="/register" className="font-medium text-neutral-950 underline underline-offset-2">
          Create account
        </Link>
      </p>
    </div>
  );
}
