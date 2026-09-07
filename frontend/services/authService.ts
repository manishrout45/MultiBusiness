import { apiRequest } from '@/lib/api';
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordResponse,
  LoginInput,
  PhoneOtpSendResponse,
  RegisterInput,
  RegisterResponse,
} from '@/features/auth/types';

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export async function registerRequest(input: RegisterInput): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export async function fetchMe(token: string): Promise<{ data?: AuthUser } & AuthUser> {
  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  });
}

export async function googleLoginRequest(idToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: { idToken },
  });
}

export async function sendPhoneOtpRequest(phone: string): Promise<PhoneOtpSendResponse> {
  return apiRequest<PhoneOtpSendResponse>('/auth/phone/send-otp', {
    method: 'POST',
    body: { phone },
  });
}

export async function verifyPhoneOtpRequest(
  phone: string,
  code: string
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/phone/verify-otp', {
    method: 'POST',
    body: { phone, code },
  });
}

export async function sendEmailOtpRequest(email: string): Promise<{ message: string; devOtp?: string }> {
  return apiRequest('/auth/email/send-otp', {
    method: 'POST',
    body: { email },
  });
}

export async function verifyEmailRequest(
  email: string,
  code: string
): Promise<{ message: string; verified: boolean }> {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: { email, code },
  });
}

export async function forgotPasswordRequest(email: string): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export async function resetPasswordRequest(token: string, password: string): Promise<{ message: string }> {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}
