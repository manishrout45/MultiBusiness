'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthSocialOptions } from '@/components/auth/AuthSocialOptions';
import { PasswordField } from '@/components/auth/PasswordField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth';
import { APP_NAME } from '@/lib/constants';
import { ApiError } from '@/lib/api';
import { sendPhoneOtpRequest } from '@/services/authService';
import { cn } from '@/lib/utils';

type LoginMode = 'email' | 'phone';

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithPhone } = useAuth();

  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const presetEmail = searchParams.get('email');
    if (presetEmail) setEmail(presetEmail);
    if (searchParams.get('registered') === '1') {
      setNotice('Account created. Verify your email before signing in.');
    } else if (searchParams.get('verified') === '1') {
      setNotice('Email verified. Sign in with your email and password.');
    } else if (searchParams.get('reset') === '1') {
      setNotice('Password updated. Sign in with your new password.');
    }
  }, [searchParams]);

  const goNext = () => {
    const next = searchParams.get('next') || '/';
    router.push(next);
    router.refresh();
  };

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setError(null);
    setShowReset(false);
    setShowCreateAccount(false);
    setOtp('');
    setOtpSent(false);
    setDevOtp(null);
  };

  const onEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setShowReset(false);
    setShowCreateAccount(false);
    setPending(true);
    try {
      await login({ email: email.trim(), password });
      goNext();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to sign in';
      setError(message);
      if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      if (err instanceof ApiError && err.code === 'ACCOUNT_NOT_FOUND') {
        setShowCreateAccount(true);
        return;
      }
      if (
        err instanceof ApiError &&
        (err.code === 'INVALID_PASSWORD' || err.code === 'INVALID_CREDENTIALS')
      ) {
        setShowReset(true);
      }
    } finally {
      setPending(false);
    }
  };

  const onSendOtp = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await sendPhoneOtpRequest(phone.trim());
      setPhone(result.phone);
      setOtpSent(true);
      setDevOtp(result.devOtp || null);
      if (result.devOtp) setOtp(result.devOtp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to send OTP');
    } finally {
      setPending(false);
    }
  };

  const onVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await loginWithPhone(phone.trim(), otp.trim());
      goNext();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to verify OTP');
    } finally {
      setPending(false);
    }
  };

  const forgotHref = `/forgot-password${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''}`;

  return (
    <div className={cn('space-y-5', className)}>
      {notice && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      {mode === 'email' ? (
        <form onSubmit={onEmailSubmit} className="space-y-4">
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
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {showCreateAccount && (
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
              New here?{' '}
              <Link
                href={`/register?email=${encodeURIComponent(email.trim())}`}
                className="font-medium underline underline-offset-2"
              >
                Create an account first
              </Link>
              , then sign in.
            </p>
          )}

          {showReset && (
            <p className="text-sm text-neutral-600">
              Forgot your password?{' '}
              <Link href={forgotHref} className="font-medium text-primary underline underline-offset-2">
                Reset it here
              </Link>
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
              'Sign in with email'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={otpSent ? onVerifyOtp : onSendOtp} className="space-y-4">
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            disabled={otpSent}
            className="h-12 rounded-xl border-neutral-300 bg-white text-base shadow-none focus-visible:ring-primary"
          />

          {otpSent && (
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={4}
              maxLength={8}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="Enter OTP"
              className="h-12 rounded-xl border-neutral-300 bg-white text-base tracking-widest shadow-none focus-visible:ring-primary"
            />
          )}

          {devOtp && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Dev OTP (SMS not configured): <strong>{devOtp}</strong>
            </p>
          )}

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
                {otpSent ? 'Verifying…' : 'Sending OTP…'}
              </>
            ) : otpSent ? (
              'Verify & sign in'
            ) : (
              'Send OTP'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-neutral-600 underline underline-offset-2 hover:text-neutral-950"
              onClick={() => switchMode('email')}
            >
              Use email instead
            </button>
            {otpSent && (
              <button
                type="button"
                disabled={pending}
                className="text-primary underline underline-offset-2 disabled:opacity-50"
                onClick={() => onSendOtp()}
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      <AuthSocialOptions
        onGoogleSuccess={goNext}
        onError={setError}
        onPhoneClick={() => switchMode('phone')}
        hidePhone={mode === 'phone'}
      />

      <p className="pt-1 text-center text-sm text-neutral-600">
        New to {APP_NAME}?{' '}
        <Link href="/register" className="font-medium text-neutral-950 underline underline-offset-2">
          Create account
        </Link>
      </p>
    </div>
  );
}
