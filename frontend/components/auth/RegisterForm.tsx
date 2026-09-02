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
import { saveVendorRegisterDraft } from '@/lib/vendorRegister';
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
      if (role === 'vendor') {
        saveVendorRegisterDraft({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
        });
        router.push('/vendor/register');
        return;
      }

      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role: 'customer',
      });
      router.push('/');
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
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: 'customer', label: 'Customer', hint: 'Shop local businesses' },
              { value: 'vendor', label: 'Vendor', hint: 'Sell on LocalMart' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={cn(
                'flex h-auto min-h-11 flex-col items-center justify-center rounded-xl border px-2 py-2 text-sm font-medium transition-colors',
                role === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  'mt-0.5 text-[10px] font-normal',
                  role === option.value ? 'text-primary-foreground/80' : 'text-neutral-400'
                )}
              >
                {option.hint}
              </span>
            </button>
          ))}
        </div>

        {role === 'vendor' && (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-neutral-600">
            Next step: complete the <strong>Become a Seller</strong> form with your business
            details.
          </p>
        )}

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
              {role === 'vendor' ? 'Opening seller form…' : 'Creating account…'}
            </>
          ) : role === 'vendor' ? (
            'Continue to Become a Seller'
          ) : (
            'Create customer account'
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
