import { useEffect } from 'react';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { APP_NAME } from '@/lib/constants';

export default function ResetPasswordPage() {
  useEffect(() => {
    document.title = `New password | ${APP_NAME}`;
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{APP_NAME}</h1>
          <p className="mt-2 text-sm text-neutral-500">Choose a new password, then sign in.</p>
        </div>
        <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
