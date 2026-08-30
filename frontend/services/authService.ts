import { apiRequest } from '@/lib/api';
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from './types';

export async function loginRequest(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export async function registerRequest(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
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
