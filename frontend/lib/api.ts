const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  code?: string;
  maxDevices?: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'code' in payload &&
      typeof (payload as { code: unknown }).code === 'string'
    ) {
      this.code = (payload as { code: string }).code;
    }
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'maxDevices' in payload
    ) {
      const n = Number((payload as { maxDevices: unknown }).maxDevices);
      if (Number.isFinite(n) && n >= 1) this.maxDevices = n;
    }
  }
}

/** Prefer API `maxDevices` (from MAX_DEVICES_PER_USER); fallback only if missing. */
export function getMaxDevicesFromError(err: unknown, fallback = 2): number {
  if (err instanceof ApiError && typeof err.maxDevices === 'number' && err.maxDevices >= 1) {
    return err.maxDevices;
  }
  return fallback;
}

export function getApiErrorCode(err: unknown): string | undefined {
  if (err instanceof ApiError) return err.code;
  return undefined;
}

export type SessionInvalidatedInfo = {
  code?: string;
  message: string;
};

type SessionInvalidatedListener = (info: SessionInvalidatedInfo) => void;

const sessionInvalidatedListeners = new Set<SessionInvalidatedListener>();

/** AuthProvider (and others) subscribe so a kicked device clears login UI immediately. */
export function onSessionInvalidated(listener: SessionInvalidatedListener): () => void {
  sessionInvalidatedListeners.add(listener);
  return () => {
    sessionInvalidatedListeners.delete(listener);
  };
}

function notifySessionInvalidated(info: SessionInvalidatedInfo) {
  sessionInvalidatedListeners.forEach((listener) => {
    try {
      listener(info);
    } catch {
      // ignore listener errors
    }
  });
}

function readErrorCode(payload: unknown): string | undefined {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'code' in payload &&
    typeof (payload as { code: unknown }).code === 'string'
  ) {
    return (payload as { code: string }).code;
  }
  return undefined;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
  /** Skip JSON parse for empty responses */
  raw?: boolean;
  /** Next.js cache hint — ignored in the React SPA */
  next?: unknown;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, token, headers, raw, next: _next, ...rest } = options;

  const response = await fetch(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text && !raw) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed (${response.status})`;
    const code = readErrorCode(payload);
    if (
      response.status === 401 &&
      (code === 'SESSION_REVOKED' || code === 'SESSION_REQUIRED')
    ) {
      notifySessionInvalidated({ code, message });
    }
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
