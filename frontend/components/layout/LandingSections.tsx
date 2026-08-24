'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BusinessCard } from '@/components/BusinessCard';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionReveal } from '@/components/layout/SectionReveal';
import { Button } from '@/components/ui/button';
import type { Business } from '@/features/businesses';
import { CATEGORIES } from '@/features/categories';

export function CategoriesSection() {
  return (
    <SectionReveal className="py-14 md:py-20" delay={0.05}>
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Explore popular categories and discover businesses in your area.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/categories">
              View all
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

interface FeaturedBusinessesSectionProps {
  businesses: Business[];
}

export function FeaturedBusinessesSection({ businesses }: FeaturedBusinessesSectionProps) {
  return (
    <SectionReveal className="bg-muted/20 py-14 md:py-20" delay={0.1}>
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured local businesses
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Top-rated businesses trusted by your community.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/businesses">
              See all businesses
              <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
