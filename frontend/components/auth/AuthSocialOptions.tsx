import { useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/features/auth';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function getGoogleClientId() {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-gsi]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google script failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google script failed'));
    document.head.appendChild(script);
  });
}

const socialBtnClass =
  'flex h-12 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white transition hover:bg-neutral-50';

interface AuthSocialOptionsProps {
  onGoogleSuccess?: () => void;
  onError?: (message: string) => void;
  onPhoneClick?: () => void;
  hidePhone?: boolean;
}

export function AuthSocialOptions({
  onGoogleSuccess,
  onError,
  onPhoneClick,
  hidePhone = false,
}: AuthSocialOptionsProps) {
  const { toast } = useToast();
  const { loginWithGoogle } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const successRef = useRef(onGoogleSuccess);
  const errorRef = useRef(onError);
  successRef.current = onGoogleSuccess;
  errorRef.current = onError;

  useEffect(() => {
    const clientId = getGoogleClientId();
    if (!clientId) return;

    let cancelled = false;

    const handleCredential = async (response: { credential: string }) => {
      try {
        await loginWithGoogle(response.credential);
        successRef.current?.();
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Google sign-in failed';
        errorRef.current?.(message);
        toast({ title: 'Google sign-in', description: message, variant: 'error' });
      }
    };

    (async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !googleBtnRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'signin',
          ux_mode: 'popup',
          callback: handleCredential,
        });

        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'icon',
          theme: 'outline',
          size: 'large',
          shape: 'square',
        });
      } catch {
        if (!cancelled) {
          toast({
            title: 'Google sign-in',
            description: 'Could not load Google. Check your Client ID and restart the app.',
            variant: 'error',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, toast]);

  const onPhone = () => {
    if (onPhoneClick) {
      onPhoneClick();
      return;
    }
    toast({
      title: 'Phone sign-in',
      description: 'Use email and password for now. Phone login will follow.',
    });
  };

  const onGoogleMissing = () => {
    toast({
      title: 'Google sign-in',
      description: 'Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID in .env, then restart.',
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-sm text-neutral-500">or</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className={cn('grid gap-3', hidePhone ? 'grid-cols-1' : 'grid-cols-2')}>
        {!hidePhone && (
          <button type="button" aria-label="Continue with phone" onClick={onPhone} className={socialBtnClass}>
            <Phone className="size-5 text-primary" strokeWidth={2.25} />
          </button>
        )}

        {getGoogleClientId() ? (
          <div className="relative h-12 w-full">
            <div className={`${socialBtnClass} pointer-events-none`} aria-hidden>
              <GoogleIcon className="size-5" />
            </div>
            <div
              ref={googleBtnRef}
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0"
              aria-label="Sign in with Google"
            />
          </div>
        ) : (
          <button type="button" aria-label="Sign in with Google" onClick={onGoogleMissing} className={socialBtnClass}>
            <GoogleIcon className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
