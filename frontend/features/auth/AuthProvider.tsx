'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from '@/features/auth/types';
import { fetchMe, loginRequest, registerRequest } from '@/services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readStoredAuth();
    setToken(stored.token);
    setUser(stored.user);
    setIsLoading(false);

    if (stored.token) {
      fetchMe(stored.token)
        .then((profile) => {
          const nextUser = (profile.data ?? profile) as AuthUser;
          if (nextUser?.id) {
            setUser(nextUser);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
          }
        })
        .catch(() => {
          clearAuthStorage();
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginRequest(input);
    persistAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await registerRequest(input);
    persistAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    const profile = await fetchMe(token);
    const nextUser = (profile.data ?? profile) as AuthUser;
    setUser(nextUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, register, logout, refreshProfile]
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
