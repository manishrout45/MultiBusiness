import {
  useLocation,
  useNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (href: string) => {
      navigate(href);
    },
    replace: (href: string) => {
      navigate(href, { replace: true });
    },
    back: () => {
      navigate(-1);
    },
    forward: () => {
      navigate(1);
    },
    refresh: () => {
      // App Router refresh is a no-op in the SPA — client state already updates.
    },
    prefetch: (_href?: string) => {
      // Client-side routing does not need a prefetch step.
    },
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  const [params] = useRouterSearchParams();
  return params;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useRouterParams() as T;
}

export function notFound(): never {
  throw new Error('NEXT_NOT_FOUND');
}

export function redirect(href: string): never {
  throw new Error(`NEXT_REDIRECT:${href}`);
}

export function useSelectedLayoutSegment() {
  return null;
}

export function useSelectedLayoutSegments() {
  return [] as string[];
}
