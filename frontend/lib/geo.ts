/** Earth radius in kilometers */
const EARTH_RADIUS_KM = 6371;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Haversine distance between two WGS84 coordinates, in kilometers. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Human-readable distance label (e.g. "500 m away", "1.2 km away"). */
export function formatDistance(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return '';
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000));
    return `${meters} m away`;
  }
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function isValidCoordinate(
  lat: unknown,
  lng: unknown
): lat is number {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

export function parseCoordinate(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
