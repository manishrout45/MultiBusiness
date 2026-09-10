'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/lib/api';
import { sendAadhaarOtpRequest, verifyAadhaarOtpRequest } from '@/services/authService';

export function VerifyAadhaarForm() {
  const router = useRouter();
  const { token, user, refreshProfile, isLoading } = useAuth();
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [masked, setMasked] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!token || !user) {
      router.replace('/login?next=/verify-aadhaar');
      return;
    }
    if (user.role !== 'vendor' && user.role !== 'business_manager') {
      router.replace('/');
      return;
    }
    if (Number(user.aadhaar_verified) === 1) {
      router.replace(user.role === 'vendor' ? '/vendor/dashboard' : '/admin/dashboard');
    }
  }, [isLoading, token, user, router]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setPending(true);
    try {
      const res = await sendAadhaarOtpRequest(token, aadhaar.replace(/\D/g, ''));
      setVerificationId(res.data.verificationId);
      setMasked(res.data.maskedAadhaar);
      setDevOtp(res.data.devOtp || null);
      if (res.data.devOtp) setOtp(res.data.devOtp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send OTP');
    } finally {
      setPending(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !verificationId) return;
    setError(null);
    setPending(true);
    try {
      await verifyAadhaarOtpRequest(token, verificationId, otp.trim());
      await refreshProfile();
      router.replace(user?.role === 'vendor' ? '/vendor/dashboard' : '/admin/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed');
    } finally {
      setPending(false);
    }
  };

  if (isLoading || !user) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Aadhaar OTP verification is required for vendors and business managers. Mock mode is
        active until a paid KYC provider key is added (~₹1–₹5 per verify).
      </p>

      {!verificationId ? (
        <form onSubmit={(e) => void sendOtp(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar number</Label>
            <Input
              id="aadhaar"
              inputMode="numeric"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="12-digit Aadhaar"
              required
              minLength={12}
              maxLength={12}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending || aadhaar.length !== 12}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" /> Sending…
              </>
            ) : (
              'Send OTP'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={(e) => void verify(e)} className="space-y-4">
          <p className="text-sm">
            OTP sent for <strong>{masked}</strong>
          </p>
          {devOtp && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Dev OTP (mock): <strong>{devOtp}</strong>
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="aadhaar-otp">Enter OTP</Label>
            <Input
              id="aadhaar-otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit OTP"
              required
              minLength={6}
              maxLength={6}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={pending || otp.length !== 6}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" /> Verifying…
              </>
            ) : (
              'Verify Aadhaar'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setVerificationId(null);
              setOtp('');
              setDevOtp(null);
              setError(null);
            }}
          >
            Use a different Aadhaar
          </Button>
        </form>
      )}
    </div>
  );
}
