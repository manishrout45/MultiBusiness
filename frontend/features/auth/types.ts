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
  aadhaar_verified?: number | boolean;
  aadhaar_masked?: string | null;
  aadhaar_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
  session?: {
    replacedOldest?: boolean;
    maxDevices?: number;
  };
  code?: string;
  devices?: Array<{
    deviceId: string;
    deviceLabel?: string | null;
    lastSeenAt?: string;
  }>;
  maxDevices?: number;
}

export interface LoginInput {
  email: string;
  password: string;
  force?: boolean;
}

export interface PhoneOtpSendResponse {
  message: string;
  phone: string;
  expiresIn: number;
  devOtp?: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  needsEmailVerification?: boolean;
  devOtp?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'vendor';
}

export interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string;
}

export const AUTH_TOKEN_KEY = 'marketplace_auth_token';
export const AUTH_USER_KEY = 'marketplace_auth_user';
