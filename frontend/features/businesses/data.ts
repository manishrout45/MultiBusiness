import type { Business } from './types';

/** Offline fallback only — preferred source is the API. Coords near Bhubaneswar for map demos. */
export const FEATURED_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Pizza Hub',
    slug: 'pizza-hub',
    category: 'Restaurant',
    categorySlug: 'restaurant',
    location: 'Janpath Road',
    city: 'Bhubaneswar',
    rating: 4.8,
    reviewCount: 312,
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    featured: true,
    description: 'Wood-fired pizzas and Italian favorites near you.',
    distanceKm: 1.2,
    isOpen: true,
    badge: 'Bestseller',
    latitude: 20.268,
    longitude: 85.841,
    productCount: 24,
  },
  {
    id: '2',
    name: 'Fashion World',
    slug: 'fashion-world',
    category: 'Clothing Store',
    categorySlug: 'retail',
    location: 'Forum Galleria',
    city: 'Bhubaneswar',
    rating: 4.6,
    reviewCount: 188,
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    featured: true,
    description: 'Trendy fashion and lifestyle boutique.',
    distanceKm: 2.4,
    isOpen: true,
    badge: 'Bestseller',
    latitude: 20.312,
    longitude: 85.818,
    productCount: 86,
  },
  {
    id: '3',
    name: 'Tech Repair',
    slug: 'tech-repair',
    category: 'Electronics',
    categorySlug: 'electronics',
    location: 'Saheed Nagar',
    city: 'Bhubaneswar',
    rating: 4.9,
    reviewCount: 256,
    imageUrl:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    featured: true,
    description: 'Phone, laptop and gadget repair specialists.',
    distanceKm: 0.8,
    isOpen: true,
    badge: 'Top rated',
    latitude: 20.296,
    longitude: 85.845,
    productCount: 40,
    businessType: 'Electronics Repair',
  },
  {
    id: '4',
    name: 'Beauty Salon',
    slug: 'beauty-salon',
    category: 'Beauty',
    categorySlug: 'services',
    location: 'Patia Square',
    city: 'Bhubaneswar',
    rating: 4.7,
    reviewCount: 142,
    imageUrl:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    featured: true,
    description: 'Premium salon and spa experiences.',
    distanceKm: 1.9,
    isOpen: true,
    latitude: 20.354,
    longitude: 85.826,
    productCount: 12,
    businessType: 'Beauty Services',
  },
  {
    id: '5',
    name: 'Home Decor',
    slug: 'home-decor',
    category: 'Home & Living',
    categorySlug: 'services',
    location: 'CRP Square',
    city: 'Bhubaneswar',
    rating: 4.5,
    reviewCount: 97,
    imageUrl:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    featured: true,
    description: 'Furniture and décor for modern homes.',
    distanceKm: 3.1,
    isOpen: false,
    latitude: 20.275,
    longitude: 85.833,
    productCount: 55,
  },
  {
    id: '6',
    name: 'Fitness Gym',
    slug: 'fitness-gym',
    category: 'Services',
    categorySlug: 'services',
    location: 'Infocity',
    city: 'Bhubaneswar',
    rating: 4.8,
    reviewCount: 204,
    imageUrl:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    featured: true,
    description: 'Strength training and group fitness classes.',
    distanceKm: 2.7,
    isOpen: true,
    badge: 'Popular',
    latitude: 20.335,
    longitude: 85.807,
    productCount: 8,
    businessType: 'Fitness Services',
  },
];

export function filterBusinesses(
  businesses: Business[],
  query: string,
  category?: string
): Business[] {
  const normalizedQuery = query.trim().toLowerCase();
  return businesses.filter((business) => {
    const matchesQuery =
      !normalizedQuery ||
      business.name.toLowerCase().includes(normalizedQuery) ||
      business.category.toLowerCase().includes(normalizedQuery) ||
      business.city.toLowerCase().includes(normalizedQuery) ||
      business.location.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      !category || business.categorySlug === category || business.category === category;

    return matchesQuery && matchesCategory;
  });
}
