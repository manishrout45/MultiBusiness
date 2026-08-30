'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BusinessCardSkeleton,
  DiscoveryMap,
  DiscoverySearch,
  EmptyState,
  MarketplaceBusinessCard,
  MarketplaceProductCard,
  MapSkeleton,
  PopularCategoriesGrid,
  ProductCardSkeleton,
  SearchResultTabs,
  SortFilterBar,
  type SearchResultTab,
  type SortOption,
} from '@/components/discovery';
import type { Business } from '@/features/businesses';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  buildDisplayCategories,
  type DisplayCategory,
} from '@/lib/displayCategories';
import { haversineDistanceKm, isValidCoordinate } from '@/lib/geo';
import { matchesPopularCategory } from '@/lib/popularCategories';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  PRODUCT_ROTATION_MS,
  type SearchRadiusKm,
} from '@/lib/theme';
import { fetchNearbyBusinessPool } from '@/services/businessService';
import { listCategories } from '@/services/categoryService';
import { searchCatalogProducts, type CatalogProduct } from '@/services/catalogService';

function isServiceBusiness(b: Business) {
  const hay = `${b.category} ${b.categorySlug} ${b.businessType ?? ''}`.toLowerCase();
  return (
    hay.includes('service') ||
    hay.includes('repair') ||
    hay.includes('salon') ||
    hay.includes('plumber') ||
    hay.includes('electric') ||
    hay.includes('beauty')
  );
}

function businessMatchesCategory(b: Business, cat: DisplayCategory | null) {
  if (!cat) return true;
  if (cat.id && b.categoryId === cat.id) return true;
  return matchesPopularCategory(
    `${b.name} ${b.category} ${b.categorySlug} ${b.businessType ?? ''} ${b.description}`,
    cat
  );
}

function productMatchesCategory(p: CatalogProduct, cat: DisplayCategory | null) {
  if (!cat) return true;
  return matchesPopularCategory(
    `${p.name} ${p.category} ${p.categorySlug} ${p.businessName ?? ''} ${p.description}`,
    cat
  );
}

function withDistances(
  businesses: Business[],
  lat: number | null,
  lng: number | null
): Business[] {
  if (lat == null || lng == null) {
    return businesses.map((b) => ({ ...b, distanceKm: null }));
  }
  return businesses.map((b) => {
    if (!isValidCoordinate(b.latitude, b.longitude)) {
      return { ...b, distanceKm: null };
    }
    return {
      ...b,
      distanceKm: haversineDistanceKm(
        { latitude: lat, longitude: lng },
        { latitude: b.latitude as number, longitude: b.longitude as number }
      ),
    };
  });
}

function filterByRadius(businesses: Business[], radiusKm: number, hasLocation: boolean) {
  if (!hasLocation) return businesses;
  return businesses.filter((b) => b.distanceKm != null && b.distanceKm <= radiusKm);
}

function sortBusinesses(list: Business[], sort: SortOption) {
  const next = [...list];
  next.sort((a, b) => {
    if (sort === 'distance') {
      return (
        (a.distanceKm ?? Number.POSITIVE_INFINITY) -
        (b.distanceKm ?? Number.POSITIVE_INFINITY)
      );
    }
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'popularity') {
      return (
        (b.reviewCount || 0) +
        (b.featured ? 50 : 0) -
        ((a.reviewCount || 0) + (a.featured ? 50 : 0))
      );
    }
    return 0;
  });
  return next;
}

function pickRotatedProducts(pool: CatalogProduct[], count: number): CatalogProduct[] {
  if (pool.length <= count) return [...pool];
  const byVendor = new Map<string, CatalogProduct[]>();
  for (const p of pool) {
    const key = p.vendorId || p.id;
    const arr = byVendor.get(key) || [];
    arr.push(p);
    byVendor.set(key, arr);
  }
  const vendors = [...byVendor.keys()].sort(() => Math.random() - 0.5);
  const picked: CatalogProduct[] = [];
  const usedCategories = new Set<string>();

  for (const vendorId of vendors) {
    if (picked.length >= count) break;
    const items = byVendor.get(vendorId) || [];
    const preferred =
      items.find((p) => !usedCategories.has(p.categorySlug)) || items[0];
    if (preferred) {
      picked.push(preferred);
      usedCategories.add(preferred.categorySlug);
    }
  }

  while (picked.length < count) {
    const leftover = pool.filter((p) => !picked.some((x) => x.id === p.id));
    if (!leftover.length) break;
    picked.push(leftover[Math.floor(Math.random() * leftover.length)]);
  }

  return picked;
}

export function HomeDiscoveryPage() {
  const {
    location,
    status: locationStatus,
    error: locationError,
    requestCurrentLocation,
    setManualLocation,
  } = useUserLocation(true);

  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [radius, setRadius] = useState<SearchRadiusKm>(DEFAULT_SEARCH_RADIUS_KM);
  const [displayCategories, setDisplayCategories] = useState<DisplayCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DisplayCategory | null>(null);
  const [businessesRaw, setBusinessesRaw] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [productsPool, setProductsPool] = useState<CatalogProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [rotatedProducts, setRotatedProducts] = useState<CatalogProduct[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('distance');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [resultTab, setResultTab] = useState<SearchResultTab>('all');
  const [rotationTick, setRotationTick] = useState(0);

  const userLat = location?.latitude ?? null;
  const userLng = location?.longitude ?? null;
  const hasLocation = userLat != null && userLng != null;

  useEffect(() => {
    let cancelled = false;
    listCategories().then((api) => {
      if (!cancelled) setDisplayCategories(buildDisplayCategories(api));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setBusinessesLoading(true);
      try {
        const data = await fetchNearbyBusinessPool({
          query: activeQuery || undefined,
          categoryId: selectedCategory?.id,
          limit: 100,
        });
        if (!cancelled) setBusinessesRaw(data);
      } catch {
        if (!cancelled) setBusinessesRaw([]);
      } finally {
        if (!cancelled) setBusinessesLoading(false);
      }
    }, activeQuery ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeQuery, selectedCategory?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      try {
        const rows = await searchCatalogProducts({
          q: activeQuery || undefined,
          categoryId: selectedCategory?.id,
          limit: 48,
          sort: 'newest',
        });
        if (!cancelled) setProductsPool(rows);
      } catch {
        if (!cancelled) setProductsPool([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeQuery, selectedCategory?.id]);

  useEffect(() => {
    const id = window.setInterval(() => setRotationTick((t) => t + 1), PRODUCT_ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const businessesWithDistance = useMemo(
    () => withDistances(businessesRaw, userLat, userLng),
    [businessesRaw, userLat, userLng]
  );

  const nearbyBusinesses = useMemo(() => {
    let list = filterByRadius(businessesWithDistance, radius, hasLocation);
    list = list.filter((b) => businessMatchesCategory(b, selectedCategory));
    if (minRating != null) {
      list = list.filter((b) => (b.rating || 0) >= minRating);
    }
    if (resultTab === 'services') {
      list = list.filter(isServiceBusiness);
    } else if (resultTab === 'stores') {
      list = list.filter((b) => !isServiceBusiness(b));
    }
    return sortBusinesses(list, sort);
  }, [
    businessesWithDistance,
    radius,
    hasLocation,
    selectedCategory,
    minRating,
    resultTab,
    sort,
  ]);

  const productsForResults = useMemo(() => {
    let list = productsPool
      .filter((p) => productMatchesCategory(p, selectedCategory))
      .map((p) => {
        if (
          userLat == null ||
          userLng == null ||
          !isValidCoordinate(p.latitude, p.longitude)
        ) {
          return { ...p, distanceKm: null as number | null };
        }
        return {
          ...p,
          distanceKm: haversineDistanceKm(
            { latitude: userLat, longitude: userLng },
            { latitude: p.latitude as number, longitude: p.longitude as number }
          ),
        };
      });

    if (hasLocation) {
      list = list.filter((p) => p.distanceKm == null || p.distanceKm <= radius);
    }
    if (minRating != null) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }
    if (sort === 'price') {
      list = [...list].sort(
        (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
      );
    } else if (sort === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'distance') {
      list = [...list].sort(
        (a, b) =>
          (a.distanceKm ?? Number.POSITIVE_INFINITY) -
          (b.distanceKm ?? Number.POSITIVE_INFINITY)
      );
    }
    return list;
  }, [productsPool, selectedCategory, userLat, userLng, hasLocation, radius, minRating, sort]);

  useEffect(() => {
    setRotatedProducts(pickRotatedProducts(productsForResults, 8));
  }, [productsForResults, rotationTick]);

  const serviceBusinesses = useMemo(
    () => nearbyBusinesses.filter(isServiceBusiness),
    [nearbyBusinesses]
  );

  const tabCounts = useMemo(
    () => ({
      all: nearbyBusinesses.length + productsForResults.length,
      stores: nearbyBusinesses.filter((b) => !isServiceBusiness(b)).length,
      products: productsForResults.length,
      services: serviceBusinesses.length,
    }),
    [nearbyBusinesses, productsForResults, serviceBusinesses]
  );

  const runSearch = useCallback(() => {
    setActiveQuery(query.trim());
    setResultTab('all');
  }, [query]);

  const showProductsSection = resultTab === 'all' || resultTab === 'products';
  const showMapSection = resultTab === 'all' || resultTab === 'stores' || resultTab === 'services';

  const categoryThemeStyle = selectedCategory
    ? { borderColor: `${selectedCategory.themeColor}40` }
    : undefined;

  return (
    <div className="bg-card">
      <DiscoverySearch
        query={query}
        onQueryChange={setQuery}
        onSearch={runSearch}
        radius={radius}
        onRadiusChange={setRadius}
        location={location}
        locationStatus={locationStatus}
        locationError={locationError}
        onDetectLocation={requestCurrentLocation}
        onSelectLocation={setManualLocation}
      />

      <PopularCategoriesGrid
        categories={displayCategories}
        selectedSlug={selectedCategory?.slug ?? null}
        onSelect={setSelectedCategory}
      />

      <div className="container space-y-10 py-8 sm:py-10">
        {activeQuery ? (
          <SearchResultTabs
            value={resultTab}
            onChange={setResultTab}
            counts={tabCounts}
            query={activeQuery}
          />
        ) : null}

        {showMapSection ? (
          <section className="space-y-4" style={categoryThemeStyle}>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-dark">Discover on Map</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore nearby stores within your selected radius
                {selectedCategory ? (
                  <>
                    {' '}
                    ·{' '}
                    <span style={{ color: selectedCategory.themeColor }}>
                      {selectedCategory.name}
                    </span>
                  </>
                ) : null}
              </p>
            </div>

            <SortFilterBar
              sort={sort}
              onSortChange={setSort}
              minRating={minRating}
              onMinRatingChange={setMinRating}
            />

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <div className="min-h-[280px] rounded-2xl border border-dashed border-border bg-light/40 p-3 sm:min-h-[360px] lg:min-h-[420px]">
                {businessesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <BusinessCardSkeleton key={i} compact />
                    ))}
                  </div>
                ) : nearbyBusinesses.length === 0 ? (
                  <div className="flex h-full min-h-[240px] items-center justify-center">
                    <EmptyState
                      icon="store"
                      title="No businesses to show on the map"
                      description="Try increasing your search radius or selecting another category."
                      className="border-0 bg-transparent py-6"
                    />
                  </div>
                ) : (
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {nearbyBusinesses.map((b) => (
                      <MarketplaceBusinessCard
                        key={b.id}
                        business={b}
                        compact
                        selected={selectedBusinessId === b.id}
                        onSelect={setSelectedBusinessId}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
                {businessesLoading && !businessesRaw.length ? (
                  <MapSkeleton className="h-full min-h-[280px] rounded-2xl lg:min-h-[420px]" />
                ) : (
                  <DiscoveryMap
                    className="h-full min-h-[280px] rounded-2xl lg:min-h-[420px]"
                    userLat={userLat}
                    userLng={userLng}
                    radiusKm={radius}
                    businesses={nearbyBusinesses}
                    selectedId={selectedBusinessId}
                    onSelectBusiness={setSelectedBusinessId}
                  />
                )}
              </div>
            </div>
          </section>
        ) : null}

        {showMapSection ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-dark">
                  Businesses Near You
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trusted local stores within your search radius
                </p>
              </div>
              <Link
                href="/businesses"
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            {businessesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <BusinessCardSkeleton key={i} />
                ))}
              </div>
            ) : nearbyBusinesses.length === 0 ? (
              <EmptyState
                icon="store"
                title={`No businesses found within ${radius} km`}
                description="Try increasing your search radius or changing your filters."
                actionLabel={hasLocation ? 'Increase radius' : 'Enable Location'}
                onAction={() => {
                  if (hasLocation) {
                    const next = ([10, 15, 25, 50] as SearchRadiusKm[]).find((r) => r > radius);
                    if (next) setRadius(next);
                  } else {
                    requestCurrentLocation();
                  }
                }}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {nearbyBusinesses.slice(0, 8).map((b) => (
                  <MarketplaceBusinessCard key={`near-${b.id}`} business={b} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        {showProductsSection ? (
          <section className="space-y-4 pb-2">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-dark">
                  Products Near You
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fresh picks from nearby vendors — refreshes every 5 minutes
                </p>
              </div>
              <Link
                href="/products"
                className="shrink-0 text-sm font-semibold text-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : rotatedProducts.length === 0 ? (
              <EmptyState
                icon="product"
                title="No products found nearby"
                description="Try another category, increase radius, or clear your search."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
                {rotatedProducts.map((p) => (
                  <MarketplaceProductCard key={`${p.id}-${rotationTick}`} product={p} />
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
