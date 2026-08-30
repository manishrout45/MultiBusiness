'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthSocialOptions } from '@/components/auth/AuthSocialOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';
import { APP_NAME } from '@/lib/constants';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function RegisterForm({ className }: { className?: string }) {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });
      router.push(role === 'vendor' ? '/vendor' : '/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create account');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn('space-y-5', className)}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-neutral-900"
        />

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

        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-neutral-900"
        />

        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (at least 6 characters)"
          className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-neutral-900"
        />

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: 'customer', label: 'Customer' },
              { value: 'vendor', label: 'Vendor' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={cn(
                'h-11 rounded-xl border text-sm font-medium transition-colors',
                role === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

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
              Creating account…
            </>
          ) : (
            'Continue with email'
          )}
        </Button>
      </form>

      <AuthSocialOptions />

      <p className="pt-1 text-center text-sm text-neutral-600">
        Already have a {APP_NAME} account?{' '}
        <Link href="/login" className="font-medium text-neutral-950 underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
