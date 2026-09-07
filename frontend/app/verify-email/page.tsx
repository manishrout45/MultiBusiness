import { useEffect, Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { APP_NAME } from '@/lib/constants';

export default function VerifyEmailPage() {
  useEffect(() => {
    document.title = `Verify email | ${APP_NAME}`;
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Confirm your email with the verification code before signing in.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
