import type { LucideIcon } from 'lucide-react';
import {
  Bike,
  BookOpen,
  Building2,
  Camera,
  Car,
  Armchair,
  Diamond,
  Droplets,
  Footprints,
  Gift,
  Hammer,
  Hotel,
  Lamp,
  Laptop,
  Monitor,
  PaintRoller,
  Pill,
  Plane,
  Printer,
  Scissors,
  ShoppingBasket,
  Shirt,
  Smartphone,
  Sparkles,
  Store,
  UtensilsCrossed,
  Watch,
  Wrench,
} from 'lucide-react';

export interface PopularCategoryItem {
  slug: string;
  name: string;
  /** Keywords used to match businesses/products from the API */
  keywords: string[];
  icon: LucideIcon;
}

/** Exact popular categories shown on the marketplace home (matching design). */
export const POPULAR_CATEGORIES: PopularCategoryItem[] = [
  {
    slug: 'grocery-store',
    name: 'Grocery Store',
    keywords: ['grocery', 'supermarket', 'kirana'],
    icon: ShoppingBasket,
  },
  {
    slug: 'cloth-store',
    name: 'Cloth Store',
    keywords: ['cloth', 'clothing', 'fashion', 'apparel'],
    icon: Shirt,
  },
  {
    slug: 'electronic-shop',
    name: 'Electronic Shop',
    keywords: ['electronic', 'electronics', 'gadget'],
    icon: Monitor,
  },
  {
    slug: 'mobile-accessories',
    name: 'Mobile & Accessories',
    keywords: ['mobile', 'phone', 'smartphone', 'accessories'],
    icon: Smartphone,
  },
  {
    slug: 'pharmacy',
    name: 'Pharmacy',
    keywords: ['pharmacy', 'medical', 'chemist', 'medicine'],
    icon: Pill,
  },
  {
    slug: 'restaurant-cafe',
    name: 'Restaurant & Cafe',
    keywords: ['restaurant', 'cafe', 'food', 'dining'],
    icon: UtensilsCrossed,
  },
  {
    slug: 'beauty-cosmetics',
    name: 'Beauty & Cosmetics',
    keywords: ['beauty', 'cosmetic', 'makeup'],
    icon: Sparkles,
  },
  {
    slug: 'hardware-store',
    name: 'Hardware Store',
    keywords: ['hardware', 'tools'],
    icon: Hammer,
  },
  {
    slug: 'bakery-shop',
    name: 'Bakery Shop',
    keywords: ['bakery', 'cake', 'pastry'],
    icon: Store,
  },
  {
    slug: 'book-store',
    name: 'Book Store',
    keywords: ['book', 'stationery'],
    icon: BookOpen,
  },
  {
    slug: 'xerox-print-shop',
    name: 'Xerox Print Shop',
    keywords: ['xerox', 'print', 'photocopy'],
    icon: Printer,
  },
  {
    slug: 'tour-travel-agency',
    name: 'Tour & Travel Agency',
    keywords: ['tour', 'travel', 'agency'],
    icon: Plane,
  },
  {
    slug: 'real-estate',
    name: 'Real Estate',
    keywords: ['real estate', 'property', 'realty'],
    icon: Building2,
  },
  {
    slug: 'jewellery-shop',
    name: 'Jewellery Shop',
    keywords: ['jewellery', 'jewelry', 'gold'],
    icon: Diamond,
  },
  {
    slug: 'footwear-shop',
    name: 'Footwear Shop',
    keywords: ['footwear', 'shoe', 'shoes'],
    icon: Footprints,
  },
  {
    slug: 'gift-shop',
    name: 'Gift Shop',
    keywords: ['gift'],
    icon: Gift,
  },
  {
    slug: 'computer-laptop-store',
    name: 'Computer & Laptop Store',
    keywords: ['computer', 'laptop', 'pc'],
    icon: Laptop,
  },
  {
    slug: 'furniture-store',
    name: 'Furniture Store',
    keywords: ['furniture'],
    icon: Armchair,
  },
  {
    slug: 'watch-shop',
    name: 'Watch Shop',
    keywords: ['watch'],
    icon: Watch,
  },
  {
    slug: 'salon-beauty-parlour',
    name: 'Salon & Beauty Parlour',
    keywords: ['salon', 'parlour', 'parlor', 'hair'],
    icon: Scissors,
  },
  {
    slug: 'car-wash-shop',
    name: 'Car Wash Shop',
    keywords: ['car wash', 'wash'],
    icon: Droplets,
  },
  {
    slug: 'car-showroom',
    name: 'Car Showroom',
    keywords: ['car showroom', 'automobile', 'car dealer'],
    icon: Car,
  },
  {
    slug: 'bike-showroom',
    name: 'Bike Showroom',
    keywords: ['bike showroom', 'motorcycle', 'two wheeler'],
    icon: Bike,
  },
  {
    slug: 'bike-service-repair',
    name: 'Bike Service Centre / Repair',
    keywords: ['bike service', 'bike repair', 'two wheeler service'],
    icon: Wrench,
  },
  {
    slug: 'paint-sanitary-shop',
    name: 'Paint & Sanitary Shop',
    keywords: ['paint', 'sanitary'],
    icon: PaintRoller,
  },
  {
    slug: 'home-decor',
    name: 'Home Decor',
    keywords: ['home decor', 'decor', 'interior'],
    icon: Lamp,
  },
  {
    slug: 'photo-studio',
    name: 'Photo Studio',
    keywords: ['photo', 'studio', 'photography'],
    icon: Camera,
  },
  {
    slug: 'hotel',
    name: 'Hotel',
    keywords: ['hotel', 'lodging', 'stay'],
    icon: Hotel,
  },
];

export function matchesPopularCategory(
  text: string,
  category: PopularCategoryItem
): boolean {
  const hay = text.toLowerCase();
  return category.keywords.some((k) => hay.includes(k.toLowerCase()));
}
