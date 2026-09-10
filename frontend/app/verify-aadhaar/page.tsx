import { useEffect } from 'react';
import { VerifyAadhaarForm } from '@/components/auth/VerifyAadhaarForm';
import { APP_NAME } from '@/lib/constants';

export default function VerifyAadhaarPage() {
  useEffect(() => {
    document.title = `Verify Aadhaar | ${APP_NAME}`;
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Aadhaar verification</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Confirm identity once for your vendor or manager account.
          </p>
        </div>
        <VerifyAadhaarForm />
      </div>
    </div>
  );
}
