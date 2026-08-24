import type { SearchSuggestionGroup } from './types';

/** Default suggestions — replace via API / admin config later */
export const DEFAULT_SEARCH_SUGGESTIONS: SearchSuggestionGroup[] = [
  {
    type: 'businesses',
    label: 'Businesses',
    items: [
      { id: 'b1', label: 'Pizza Hub', type: 'businesses', href: '/search?q=Pizza+Hub&type=businesses' },
      { id: 'b2', label: 'Fashion World', type: 'businesses', href: '/search?q=Fashion+World&type=businesses' },
    ],
  },
  {
    type: 'products',
    label: 'Products',
    items: [
      { id: 'p1', label: 'Mobile', type: 'products', href: '/search?q=Mobile&type=products' },
      { id: 'p2', label: 'Shoes', type: 'products', href: '/search?q=Shoes&type=products' },
      { id: 'p3', label: 'Laptop', type: 'products', href: '/search?q=Laptop&type=products' },
    ],
  },
  {
    type: 'categories',
    label: 'Categories',
    items: [
      { id: 'c1', label: 'Restaurants', type: 'categories', href: '/categories/restaurant' },
      { id: 'c2', label: 'Electronics', type: 'categories', href: '/categories/electronics' },
    ],
  },
  {
    type: 'locations',
    label: 'Locations',
    items: [
      { id: 'l1', label: 'Bhubaneswar', type: 'locations', href: '/search?city=Bhubaneswar&type=locations' },
      { id: 'l2', label: 'Odisha', type: 'locations', href: '/search?city=Odisha&type=locations' },
    ],
  },
];
