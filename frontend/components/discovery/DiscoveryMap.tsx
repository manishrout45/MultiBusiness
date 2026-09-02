'use client';

import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Business } from '@/features/businesses';
import { formatDistance } from '@/lib/geo';
import { cn } from '@/lib/utils';

interface DiscoveryMapProps {
  userLat: number | null;
  userLng: number | null;
  radiusKm: number;
  businesses: Business[];
  selectedId: string | null;
  onSelectBusiness: (id: string | null) => void;
  className?: string;
}

function userIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;border-radius:9999px;
      background:hsl(var(--info));border:3px solid white;
      box-shadow:0 0 0 4px hsl(var(--info)/0.25),0 2px 8px rgb(0 0 0 / 0.25);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function businessIcon(selected: boolean) {
  const bg = selected ? 'hsl(var(--primary))' : 'hsl(var(--danger))';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:9999px;
      background:${bg};border:2px solid white;
      box-shadow:0 2px 6px rgb(0 0 0 / 0.3);
      transform:scale(${selected ? 1.25 : 1});
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function DiscoveryMap({
  userLat,
  userLng,
  radiusKm,
  businesses,
  selectedId,
  onSelectBusiness,
  className,
}: DiscoveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const mappable = useMemo(
    () =>
      businesses.filter(
        (b) =>
          b.latitude != null &&
          b.longitude != null &&
          Number.isFinite(b.latitude) &&
          Number.isFinite(b.longitude)
      ),
    [businesses]
  );

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([20.2961, 85.8245], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      circleRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // User marker + radius
  useEffect(() => {
    const map = mapRef.current;
    if (!map || userLat == null || userLng == null) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    } else {
      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon(), zIndexOffset: 1000 })
        .bindPopup('<strong>You are here</strong>')
        .addTo(map);
    }

    const radiusMeters = radiusKm * 1000;
    if (circleRef.current) {
      circleRef.current.setLatLng([userLat, userLng]);
      circleRef.current.setRadius(radiusMeters);
    } else {
      circleRef.current = L.circle([userLat, userLng], {
        radius: radiusMeters,
        color: 'hsl(224 59% 20%)',
        fillColor: 'hsl(224 59% 20%)',
        fillOpacity: 0.08,
        weight: 2,
        opacity: 0.55,
      }).addTo(map);
    }

    const zoom = radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 15 ? 12 : 11;
    map.setView([userLat, userLng], zoom, { animate: true });
  }, [userLat, userLng, radiusKm]);

  // Business markers
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const b of mappable) {
      const lat = b.latitude as number;
      const lng = b.longitude as number;
      const selected = b.id === selectedId;
      const marker = L.marker([lat, lng], {
        icon: businessIcon(selected),
        title: b.name,
      });

      const dist = b.distanceKm != null ? formatDistance(b.distanceKm) : '';
      const rating = b.rating > 0 ? `★ ${b.rating.toFixed(1)}` : '';
      marker.bindPopup(
        `<div style="min-width:160px;font-family:inherit">
          <strong style="font-size:13px">${escapeHtml(b.name)}</strong>
          <div style="color:#64748b;font-size:11px;margin-top:2px">${escapeHtml(b.category)}</div>
          <div style="font-size:12px;margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
            ${rating ? `<span>${rating}</span>` : ''}
            ${dist ? `<span>${escapeHtml(dist)}</span>` : ''}
          </div>
          <a href="/business/${escapeHtml(b.slug)}" style="display:inline-block;margin-top:8px;color:hsl(224 59% 20%);font-weight:600;font-size:12px;text-decoration:none">View Store →</a>
        </div>`
      );

      marker.on('click', () => onSelectBusiness(b.id));
      layer.addLayer(marker);

      if (selected) {
        marker.openPopup();
        map.panTo([lat, lng], { animate: true });
      }
    }
  }, [mappable, selectedId, onSelectBusiness]);

  const hasUser = userLat != null && userLng != null;

  return (
    <div
      className={cn(
        'relative z-0 isolate overflow-hidden rounded-2xl border border-border bg-muted',
        className
      )}
    >
      <div ref={containerRef} className="relative z-0 h-full min-h-[280px] w-full" />
      {!hasUser ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-card/70 backdrop-blur-[2px]">
          <p className="max-w-xs px-4 text-center text-sm font-medium text-muted-foreground">
            Enable or select a location to see nearby businesses on the map
          </p>
        </div>
      ) : null}
      {hasUser ? (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] rounded-lg border border-border bg-card/95 px-2.5 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur sm:text-xs">
          {radiusKm} km search radius · {mappable.length} on map
        </div>
      ) : null}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
