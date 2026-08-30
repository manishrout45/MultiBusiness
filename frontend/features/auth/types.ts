export type AuthRole = 'customer' | 'vendor' | 'super_admin' | 'business_manager';

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  role: AuthRole | string;
  status?: string;
  avatar?: string | null;
  email_verified?: number | boolean;
  phone_verified?: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'vendor';
}

export const AUTH_TOKEN_KEY = 'marketplace_auth_token';
export const AUTH_USER_KEY = 'marketplace_auth_user';
