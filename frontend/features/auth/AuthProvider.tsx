'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
  type RegisterResponse,
} from '@/features/auth/types';
import { ApiError, onSessionInvalidated } from '@/lib/api';
import {
  fetchMe,
  googleLoginRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyPhoneOtpRequest,
} from '@/services/authService';

const AUTH_NOTICE_KEY = 'marketplace_auth_notice';
const SESSION_CHECK_MS = 12_000;

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  loginWithGoogle: (idToken: string, force?: boolean) => Promise<void>;
  loginWithPhone: (phone: string, code: string, force?: boolean) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): { token: string | null; user: AuthUser | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  let user: AuthUser | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as AuthUser;
    } catch {
      user = null;
    }
  }
  return { token, user };
}

function persistAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuthStorage() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function setRemoteSignOutNotice() {
  try {
    sessionStorage.setItem(
      AUTH_NOTICE_KEY,
      'Signed out on this device — your account signed in elsewhere (device limit reached).'
    );
  } catch {
    // ignore
  }
}

function redirectToLoginAfterKick() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path.startsWith('/login')) return;
  window.location.assign('/login?reason=session');
}

export function consumeAuthNotice(): string | null {
  try {
    const notice = sessionStorage.getItem(AUTH_NOTICE_KEY);
    if (notice) sessionStorage.removeItem(AUTH_NOTICE_KEY);
    return notice;
  } catch {
    return null;
  }
}

function parseProfile(profile: { user?: AuthUser; data?: AuthUser } & AuthUser): AuthUser | null {
  const raw = profile as { user?: AuthUser; data?: AuthUser } & AuthUser;
  const nextUser = (raw.user ?? raw.data ?? raw) as AuthUser;
  return nextUser?.id ? nextUser : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  const forceLocalLogout = useCallback((remote = false) => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
    if (remote) {
      setRemoteSignOutNotice();
      redirectToLoginAfterKick();
    }
  }, []);

  useEffect(() => {
    return onSessionInvalidated(() => {
      forceLocalLogout(true);
    });
  }, [forceLocalLogout]);

  useEffect(() => {
    const stored = readStoredAuth();
    setToken(stored.token);
    setUser(stored.user);
    setIsLoading(false);

    if (stored.token) {
      fetchMe(stored.token)
        .then((profile) => {
          const nextUser = parseProfile(profile);
          if (nextUser) {
            setUser(nextUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
          }
        })
        .catch((err) => {
          if (
            err instanceof ApiError &&
            (err.code === 'SESSION_REVOKED' ||
              err.code === 'SESSION_REQUIRED' ||
              err.status === 401)
          ) {
            forceLocalLogout(err.code === 'SESSION_REVOKED' || err.code === 'SESSION_REQUIRED');
            return;
          }
          forceLocalLogout(false);
        });
    }
  }, [forceLocalLogout]);

  // Keep kicked devices from looking logged-in: poll + recheck on focus/tab visible
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const checkSession = () => {
      const current = tokenRef.current;
      if (!current || cancelled) return;
      fetchMe(current)
        .then((profile) => {
          if (cancelled || tokenRef.current !== current) return;
          const nextUser = parseProfile(profile);
          if (nextUser) {
            setUser(nextUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
          }
        })
        .catch((err) => {
          if (cancelled || tokenRef.current !== current) return;
          if (
            err instanceof ApiError &&
            (err.code === 'SESSION_REVOKED' ||
              err.code === 'SESSION_REQUIRED' ||
              err.status === 401)
          ) {
            // SESSION_* already notifies via apiRequest; still clear for plain 401
            forceLocalLogout(
              err.code === 'SESSION_REVOKED' || err.code === 'SESSION_REQUIRED'
            );
          }
        });
    };

    const intervalId = window.setInterval(checkSession, SESSION_CHECK_MS);
    const onFocus = () => checkSession();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkSession();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [token, forceLocalLogout]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginRequest(input);
    persistAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string, force = false) => {
    const result = await googleLoginRequest(idToken, force);
    persistAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const loginWithPhone = useCallback(async (phone: string, code: string, force = false) => {
    const result = await verifyPhoneOtpRequest(phone, code, force);
    persistAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    return registerRequest(input);
  }, []);

  const logout = useCallback(async () => {
    const current = token;
    clearAuthStorage();
    setToken(null);
    setUser(null);
    if (current) await logoutRequest(current);
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profile = await fetchMe(token);
      const nextUser = parseProfile(profile);
      if (nextUser) {
        setUser(nextUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
      }
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === 'SESSION_REVOKED' ||
          err.code === 'SESSION_REQUIRED' ||
          err.status === 401)
      ) {
        forceLocalLogout(
          err.code === 'SESSION_REVOKED' || err.code === 'SESSION_REQUIRED'
        );
      }
      throw err;
    }
  }, [token, forceLocalLogout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      loginWithGoogle,
      loginWithPhone,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, loginWithGoogle, loginWithPhone, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
