'use client';

import { Circle, Crosshair, Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserLocation } from '@/hooks/useUserLocation';
import { cn } from '@/lib/utils';

interface LocationSelectorProps {
  location: UserLocation | null;
  status: 'idle' | 'locating' | 'ready' | 'denied' | 'error';
  error: string | null;
  onDetect: () => void;
  onSelect: (loc: Omit<UserLocation, 'source'>) => void;
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

export function LocationSelector({
  location,
  status,
  error,
  onDetect,
  onSelect,
  className,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=5&addressdetails=0`,
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
  }, [query, open]);

  return (
    <div ref={wrapRef} className={cn('relative min-w-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-card px-3 text-left text-sm transition hover:border-primary/40',
          open && 'border-primary ring-2 ring-primary/20'
        )}
      >
        <MapPin className="size-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">
          {status === 'locating'
            ? 'Detecting location…'
            : location?.label || 'Select location'}
        </span>
        {status === 'locating' ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">▼</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <Button
              type="button"
              variant="outline-primary"
              size="sm"
              className="w-full justify-start rounded-lg"
              onClick={() => {
                onDetect();
                setOpen(false);
              }}
            >
              <Crosshair className="size-4" />
              Use current location
            </Button>
          </div>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or area…"
              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
            {searching ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {results.map((r) => (
              <li key={`${r.lat}-${r.lon}-${r.display_name}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-secondary"
                  onClick={() => {
                    onSelect({
                      latitude: Number(r.lat),
                      longitude: Number(r.lon),
                      label: shortLabel(r.display_name, r.name),
                    });
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <Circle className="mt-1 size-2.5 shrink-0 fill-primary text-primary" />
                  <span className="line-clamp-2 text-foreground">
                    {shortLabel(r.display_name, r.name)}
                  </span>
                </button>
              </li>
            ))}
            {!searching && query.trim().length >= 2 && results.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                No places found
              </li>
            ) : null}
            {query.trim().length < 2 && results.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-muted-foreground">
                Type at least 2 characters to search
              </li>
            ) : null}
          </ul>
          {error ? (
            <p className="border-t border-border bg-danger/5 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
