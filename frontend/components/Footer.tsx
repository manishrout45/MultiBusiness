import Link from 'next/link';
import { Facebook, Instagram, Linkedin, ShoppingBag, Twitter } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About LocalMart', href: '/about' },
      { label: 'Careers', href: '/contact' },
      { label: 'Press', href: '/contact' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'Browse businesses', href: '/businesses' },
      { label: 'Categories', href: '/categories' },
      { label: 'Search', href: '/search' },
      { label: 'Offers', href: '/#offers' },
    ],
  },
  {
    title: 'For Businesses',
    links: [
      { label: 'Become a Seller', href: '/register' },
      { label: 'Vendor dashboard', href: '/vendor/dashboard' },
      { label: 'Subscription plans', href: '/vendor/subscription' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/contact' },
      { label: 'Orders', href: '/orders' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
] as const;

const SOCIAL = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ShoppingBag className="size-5" />
              </span>
              <span className="text-xl font-bold">{APP_NAME}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Everything local, one marketplace. Discover trusted businesses, shop products, and
              grow your store with LocalMart.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs">Made for local commerce · Bhubaneswar & beyond</p>
        </div>
      </div>
    </footer>
  );
}
