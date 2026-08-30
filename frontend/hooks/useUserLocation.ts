'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type LocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error';

export interface UserLocation {
  latitude: number;
  longitude: number;
  label: string;
  source: 'geolocation' | 'manual';
}

interface UseUserLocationResult {
  location: UserLocation | null;
  status: LocationStatus;
  error: string | null;
  requestCurrentLocation: () => void;
  setManualLocation: (loc: Omit<UserLocation, 'source'>) => void;
  clearLocation: () => void;
}

const STORAGE_KEY = 'lm_user_location_v1';

function loadStored(): UserLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserLocation;
    if (
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      parsed.label
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function persist(loc: UserLocation | null) {
  try {
    if (!loc) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // ignore
  }
}

async function reverseLabel(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error('reverse failed');
    const data = (await res.json()) as {
      name?: string;
      address?: { suburb?: string; city?: string; town?: string; village?: string; state?: string };
      display_name?: string;
    };
    const a = data.address;
    const city = a?.suburb || a?.city || a?.town || a?.village || data.name;
    if (city && a?.state) return `${city}, ${a.state}`;
    if (city) return city;
    if (data.display_name) return data.display_name.split(',').slice(0, 2).join(',').trim();
  } catch {
    // fall through
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function useUserLocation(autoDetect = true): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const applyLocation = useCallback((loc: UserLocation) => {
    setLocation(loc);
    persist(loc);
    setStatus('ready');
    setError(null);
  }, []);

  const requestCurrentLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const label = await reverseLabel(latitude, longitude);
        applyLocation({ latitude, longitude, label, source: 'geolocation' });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location access was denied. Search or select a place manually.');
        } else {
          setStatus('error');
          setError('Could not detect your location. Try again or select manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  }, [applyLocation]);

  const setManualLocation = useCallback(
    (loc: Omit<UserLocation, 'source'>) => {
      applyLocation({ ...loc, source: 'manual' });
    },
    [applyLocation]
  );

  const clearLocation = useCallback(() => {
    setLocation(null);
    persist(null);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const stored = loadStored();
    if (stored) {
      applyLocation(stored);
      return;
    }
    if (autoDetect) requestCurrentLocation();
  }, [autoDetect, applyLocation, requestCurrentLocation]);

  return {
    location,
    status,
    error,
    requestCurrentLocation,
    setManualLocation,
    clearLocation,
  };
}
