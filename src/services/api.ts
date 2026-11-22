import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { SystemStatus } from '@/types/health';
import type { BodyStatusMapResponse } from '@/types/health';

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface BodyZone {
  zone_code: string;
  mesh_name: string;
  display_name_vi: string;
}

export interface SymptomSubmitRequest {
  user_id: string;
  body_part_id: string;
  symptom_text: string;
  severity_level: 'GREEN' | 'YELLOW' | 'RED';
  client_timestamp: number;
}

export interface SymptomSubmitResponse {
  symptom_id: string;
  user_id: string;
  body_part_id: string;
  mesh_name: string;
  display_name_vi: string;
  status_color: 'GREEN' | 'YELLOW' | 'RED';
  risk_score: number;
  ai_risk_assessment: string;
  ai_advice: string;
  disclaimer: string;
  warning_message: string | null;
  citations: Array<Record<string, unknown>>;
  reported_at: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: AuthenticatedUser;
}

export interface ChatAskResponse {
  answer: string;
  disclaimer: string;
  citations: Array<Record<string, unknown>>;
}

interface SystemStatusResponse {
  api_connected: boolean;
  guardrails_active: boolean;
  model_name: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchBodyZones(): Promise<BodyZone[]> {
  const { data } = await api.get<BodyZone[]>('/symptoms/zones');
  return data;
}

export async function fetchBodyStatusMap(): Promise<BodyStatusMapResponse> {
  const { data } = await api.get<BodyStatusMapResponse>('/symptoms/status');
  return data;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const { data } = await api.get<SystemStatusResponse>('/system/status');
  return {
    apiConnected: data.api_connected,
    guardrailsActive: data.guardrails_active,
    modelName: data.model_name,
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', {
    email,
    password,
    full_name: fullName,
  });
  return data;
}

export function saveAuthSession(session: AuthResponse): void {
  localStorage.setItem('access_token', session.access_token);
  localStorage.setItem('current_user', JSON.stringify(session.user));
}

export function clearAuthSession(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('current_user');
}

export function getStoredUser(): AuthenticatedUser | null {
  const storedUser = localStorage.getItem('current_user');
  if (!storedUser) return null;

  try {
    const user: unknown = JSON.parse(storedUser);
    if (
      typeof user === 'object' &&
      user !== null &&
      'id' in user &&
      typeof user.id === 'string' &&
      'email' in user &&
      typeof user.email === 'string' &&
      'full_name' in user &&
      typeof user.full_name === 'string' &&
      'role' in user &&
      typeof user.role === 'string'
    ) {
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      };
    }
  } catch {
    clearAuthSession();
  }
  return null;
}

export async function submitSymptom(
  request: SymptomSubmitRequest
): Promise<SymptomSubmitResponse> {
  const { data } = await api.post<SymptomSubmitResponse>(
    '/symptoms/submit',
    request
  );
  return data;
}

export async function askChat(
  message: string,
  bodyPartId: string
): Promise<ChatAskResponse> {
  const { data } = await api.post<ChatAskResponse>('/chat/ask', {
    message,
    body_part_id: bodyPartId,
  });
  return data;
}

export function getAuthenticatedUserId(): string {
  const user = getStoredUser();
  if (!localStorage.getItem('access_token') || !user) {
    throw new Error('Vui lòng đăng nhập trước khi gửi triệu chứng.');
  }
  return user.id;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail;
    if (
      typeof detail === 'object' &&
      detail !== null &&
      'message' in detail &&
      typeof detail.message === 'string'
    ) {
      return detail.message;
    }
    if (typeof detail === 'string') return detail;
    if (!error.response) {
      return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend và thử lại.';
    }
    return `Yêu cầu thất bại (HTTP ${error.response.status}). Vui lòng thử lại.`;
  }
  return error instanceof Error
    ? error.message
    : 'Đã xảy ra lỗi không xác định khi gửi triệu chứng.';
}

export default api;