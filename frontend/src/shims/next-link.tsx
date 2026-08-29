import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type Href = string | { pathname?: string; query?: Record<string, string>; hash?: string };

function hrefToPath(href: Href): string {
  if (typeof href === 'string') return href;
  const path = href.pathname || '/';
  const search = href.query
    ? `?${new URLSearchParams(href.query).toString()}`
    : '';
  const hash = href.hash ? (href.hash.startsWith('#') ? href.hash : `#${href.hash}`) : '';
  return `${path}${search}${hash}`;
}

interface NextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: Href;
  replace?: boolean;
  prefetch?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
  passHref?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, replace, prefetch: _prefetch, scroll: _scroll, shallow: _shallow, locale: _locale, passHref: _passHref, ...props },
  ref
) {
  return <RouterLink ref={ref} to={hrefToPath(href)} replace={replace} {...props} />;
});

export default Link;
