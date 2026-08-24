import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  businessCount: number;
}

export const CATEGORIES: Category[] = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Dining, cafes, and local food favorites',
    icon: UtensilsCrossed,
    businessCount: 128,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    slug: 'shopping',
    description: 'Retail stores and boutique shops near you',
    icon: ShoppingBag,
    businessCount: 96,
  },
  {
    id: 'services',
    name: 'Services',
    slug: 'services',
    description: 'Home, auto, and professional services',
    icon: Wrench,
    businessCount: 84,
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Clinics, wellness, and care providers',
    icon: HeartPulse,
    businessCount: 52,
  },
  {
    id: 'education',
    name: 'Education',
    slug: 'education',
    description: 'Schools, coaching, and training centers',
    icon: GraduationCap,
    businessCount: 41,
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Events, recreation, and leisure spots',
    icon: Sparkles,
    businessCount: 37,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}
