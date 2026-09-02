'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchHomeBanners, type HomeBanner } from '@/services/bannerService';
import { cn } from '@/lib/utils';

export function HomeHeroBanner({ className }: { className?: string }) {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeBanners()
      .then(setBanners)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <section className={cn('border-b border-border/40 bg-card', className)}>
        <div className="container py-6 sm:py-8">
          <div className="h-48 animate-pulse rounded-3xl bg-muted sm:h-56 md:h-64" />
        </div>
      </section>
    );
  }

  if (!banners.length) return null;

  return (
    <section className={cn('border-b border-border/40 bg-card', className)}>
      <div className="container py-6 sm:py-8">
        <div className="relative overflow-hidden rounded-3xl">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {banners.map((banner, i) => {
              const slide = (
                <div className="relative h-48 w-full shrink-0 sm:h-56 md:h-64 lg:h-72">
                  {banner.imageUrl ? (
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      priority={i === 0}
                      className="object-cover"
                      sizes="100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-brand-gradient" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                  <div className="relative flex h-full items-center px-6 sm:px-10">
                    <div className="max-w-xl text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                        LocalMart
                      </p>
                      <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                        {banner.title}
                      </h1>
                    </div>
                  </div>
                </div>
              );

              return banner.linkUrl ? (
                <Link key={banner.id} href={banner.linkUrl} className="w-full shrink-0">
                  {slide}
                </Link>
              ) : (
                <div key={banner.id} className="w-full shrink-0">
                  {slide}
                </div>
              );
            })}
          </div>

          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === index
                      ? 'h-2.5 w-6 bg-white shadow-sm'
                      : 'size-2.5 bg-white/55 hover:bg-white/80'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
