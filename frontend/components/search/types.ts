export const SEARCH_FILTER_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'businesses', label: 'Businesses' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'locations', label: 'Locations' },
] as const;

export type SearchFilterType = (typeof SEARCH_FILTER_TYPES)[number]['id'];

export interface SearchSuggestion {
  id: string;
  label: string;
  type: Exclude<SearchFilterType, 'all'>;
  href: string;
}

export interface SearchSuggestionGroup {
  type: Exclude<SearchFilterType, 'all'>;
  label: string;
  items: SearchSuggestion[];
}
