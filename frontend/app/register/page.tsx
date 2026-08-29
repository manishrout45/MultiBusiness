import { useEffect } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  useEffect(() => {
    document.title = 'Create account | LocalMart';
  }, []);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover local businesses or list your own storefront.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
