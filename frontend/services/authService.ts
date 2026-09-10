import { apiRequest, ApiError } from '@/lib/api';
import { deviceAuthPayload } from '@/lib/device';
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordResponse,
  LoginInput,
  PhoneOtpSendResponse,
  RegisterInput,
  RegisterResponse,
} from '@/features/auth/types';

export { ApiError };

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: deviceAuthPayload({
      email: input.email,
      password: input.password,
      force: input.force === true,
    }),
  });
}

export async function registerRequest(input: RegisterInput): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export async function fetchMe(token: string): Promise<{ user?: AuthUser } & AuthUser> {
  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  });
}

export async function googleLoginRequest(
  idToken: string,
  force = false
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: deviceAuthPayload({ idToken, force }),
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
  code: string,
  force = false
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/phone/verify-otp', {
    method: 'POST',
    body: deviceAuthPayload({ phone, code, force: force === true }),
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

export async function logoutRequest(token: string): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', token });
  } catch {
    // ignore network errors on logout
  }
}

export async function sendAadhaarOtpRequest(
  token: string,
  aadhaarNumber: string
): Promise<{
  message: string;
  data: { verificationId: number; maskedAadhaar: string; expiresIn: number; devOtp?: string };
}> {
  return apiRequest('/auth/aadhaar/send-otp', {
    method: 'POST',
    token,
    body: { aadhaarNumber },
  });
}

export async function verifyAadhaarOtpRequest(
  token: string,
  verificationId: number,
  code: string
): Promise<{ message: string; user: AuthUser }> {
  return apiRequest('/auth/aadhaar/verify-otp', {
    method: 'POST',
    token,
    body: { verificationId, code },
  });
}

export async function getAadhaarStatusRequest(token: string): Promise<{
  data: {
    required: boolean;
    verified: boolean;
    maskedAadhaar: string | null;
    providerMode: string;
  };
}> {
  return apiRequest('/auth/aadhaar/status', { method: 'GET', token });
}
