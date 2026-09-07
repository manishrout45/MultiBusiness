'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendEmailOtpRequest, verifyEmailRequest } from '@/services/authService';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function VerifyEmailForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState(searchParams.get('devOtp') || '');
  const [devOtp, setDevOtp] = useState(searchParams.get('devOtp'));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    searchParams.get('registered') === '1'
      ? 'Account created. Enter the verification code sent to your email.'
      : null
  );
  const [pending, setPending] = useState(false);

  const onVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await verifyEmailRequest(email.trim(), code.trim());
      router.push(`/login?verified=1&email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to verify email');
    } finally {
      setPending(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setPending(true);
    try {
      const res = await sendEmailOtpRequest(email.trim());
      setDevOtp(res.devOtp || null);
      if (res.devOtp) setCode(res.devOtp);
      setNotice('A new verification code was sent.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to resend code');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn('space-y-5', className)}>
      {notice && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      {devOtp && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Dev OTP (email SMTP not configured): {devOtp}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={onVerify} className="space-y-4">
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-primary"
        />
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          required
          minLength={4}
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Verification code"
          className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-primary"
        />
        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying…
            </>
          ) : (
            'Verify email'
          )}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={pending || !email.trim()}
          className="text-neutral-500 underline underline-offset-2 hover:text-neutral-800 disabled:opacity-50"
        >
          Resend code
        </button>
        <Link
          href={`/login?email=${encodeURIComponent(email.trim())}`}
          className="text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
