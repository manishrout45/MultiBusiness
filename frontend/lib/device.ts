const DEVICE_ID_KEY = 'marketplace_device_id';

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceLabel(): string {
  if (typeof window === 'undefined') return 'Unknown device';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android device';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS device';
  if (/windows/i.test(ua)) return 'Windows browser';
  if (/mac os/i.test(ua)) return 'Mac browser';
  if (/linux/i.test(ua)) return 'Linux browser';
  return 'Web browser';
}

export function deviceAuthPayload(extra: Record<string, unknown> = {}) {
  return {
    deviceId: getOrCreateDeviceId(),
    deviceLabel: getDeviceLabel(),
    ...extra,
  };
}
