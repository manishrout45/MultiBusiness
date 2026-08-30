'use client';

import { ChevronDown, Loader2, MapPin, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserLocation } from '@/hooks/useUserLocation';
import {
  SEARCH_RADIUS_OPTIONS_KM,
  type SearchRadiusKm,
} from '@/lib/theme';
import { cn } from '@/lib/utils';

interface DiscoverySearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  radius: SearchRadiusKm;
  onRadiusChange: (r: SearchRadiusKm) => void;
  location: UserLocation | null;
  locationStatus: 'idle' | 'locating' | 'ready' | 'denied' | 'error';
  locationError: string | null;
  onDetectLocation: () => void;
  onSelectLocation: (loc: Omit<UserLocation, 'source'>) => void;
  className?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
}

function shortLabel(display: string, name?: string) {
  if (name) {
    const parts = display.split(',').map((p) => p.trim());
    const state = parts[parts.length - 3] || parts[1];
    return state ? `${name}, ${state}` : name;
  }
  return display.split(',').slice(0, 2).join(',').trim();
}

export function DiscoverySearch({
  query,
  onQueryChange,
  onSearch,
  radius,
  onRadiusChange,
  location,
  locationStatus,
  locationError,
  onDetectLocation,
  onSelectLocation,
  className,
}: DiscoverySearchProps) {
  const [locOpen, setLocOpen] = useState(false);
  const [locQuery, setLocQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch();
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setLocOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!locOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (locQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locQuery.trim())}&limit=5`,
          { headers: { Accept: 'application/json' } }
        );
        const data = (await res.json()) as NominatimResult[];
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [locQuery, locOpen]);

  return (
    <section className={cn('bg-card', className)}>
      <div className="container py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-dark sm:text-3xl md:text-[2rem]">
            What are you looking for?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Search products, stores, services and businesses near you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-4xl sm:mt-8">
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:border-border sm:p-1.5 sm:pl-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:px-0">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search products, stores, services, businesses..."
                className="h-11 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 sm:h-12 sm:text-base"
                aria-label="Search marketplace"
              />
            </div>

            <div className="hidden w-px self-stretch bg-border sm:mx-2 sm:block" />

            <div ref={wrapRef} className="relative sm:w-[11.5rem]">
              <button
                type="button"
                onClick={() => setLocOpen((v) => !v)}
                className="flex h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm text-foreground sm:h-12 sm:rounded-none"
              >
                <MapPin className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">
                  {locationStatus === 'locating'
                    ? 'Detecting…'
                    : location?.label || 'Current location'}
                </span>
                {locationStatus === 'locating' ? (
                  <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </button>

              {locOpen ? (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 w-[min(100vw-2rem,20rem)] overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:left-auto sm:right-0">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-secondary"
                    onClick={() => {
                      onDetectLocation();
                      setLocOpen(false);
                    }}
                  >
                    <MapPin className="size-4" />
                    Use current location
                  </button>
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <Search className="size-3.5 text-muted-foreground" />
                    <input
                      value={locQuery}
                      onChange={(e) => setLocQuery(e.target.value)}
                      placeholder="Search city or area…"
                      className="w-full bg-transparent text-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <ul className="max-h-44 overflow-y-auto py-1">
                    {results.map((r) => (
                      <li key={`${r.lat}-${r.lon}`}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-secondary"
                          onClick={() => {
                            onSelectLocation({
                              latitude: Number(r.lat),
                              longitude: Number(r.lon),
                              label: shortLabel(r.display_name, r.name),
                            });
                            setLocOpen(false);
                            setLocQuery('');
                          }}
                        >
                          {shortLabel(r.display_name, r.name)}
                        </button>
                      </li>
                    ))}
                    {searching ? (
                      <li className="px-3 py-3 text-center text-xs text-muted-foreground">
                        Searching…
                      </li>
                    ) : null}
                    {locationError ? (
                      <li className="px-3 py-2 text-xs text-danger">{locationError}</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="hidden w-px self-stretch bg-border sm:mx-1 sm:block" />

            <div className="relative sm:w-[6.5rem]">
              <select
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value) as SearchRadiusKm)}
                className="h-11 w-full appearance-none rounded-xl bg-transparent px-2 pr-7 text-sm font-medium text-foreground outline-none sm:h-12 sm:rounded-none"
                aria-label="Search radius"
              >
                {SEARCH_RADIUS_OPTIONS_KM.map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="h-11 shrink-0 rounded-xl px-6 sm:h-12 sm:rounded-full sm:px-7"
            >
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
