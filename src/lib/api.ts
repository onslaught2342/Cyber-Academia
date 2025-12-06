import { strToU8, strFromU8, compressSync, decompressSync } from 'fflate';
import { UserData } from '@/types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://cyber-academia-backend.onslaught2342.workers.dev';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('onslaught-token', token);
  } else {
    localStorage.removeItem('onslaught-token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('onslaught-token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('onslaught-token');
}

export function compressData<T>(data: T): string {
  const json = JSON.stringify(data);
  const uint8 = strToU8(json);
  const compressed = compressSync(uint8, { level: 9 });

  return btoa(String.fromCharCode(...compressed));
}

export function decompressData<T>(compressed: string): T {
  const binary = atob(compressed);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8[i] = binary.charCodeAt(i);
  }
  const decompressed = decompressSync(uint8);
  const json = strFromU8(decompressed);
  return JSON.parse(json);
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  refreshToken?: string;
  data?: T;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: { email: string; firstName: string };
}

interface SignupResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
}

interface VerifyResponse {
  success: boolean;
  token: string;
  user: { email: string; firstName: string };
}

interface DataResponse {
  success: boolean;
  data: UserData;
}

interface ScheduleResponse {
  success: boolean;
  schedule: UserData['schedule'];
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as ApiResponse<T> & T;

  if (data.refreshToken) {
    setAuthToken(data.refreshToken);
  }

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }

  return data;
}

export const authApi = {
  async signup(email: string, password: string, firstName: string): Promise<SignupResponse> {
    return apiFetch<SignupResponse>('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName }),
    });
  },

  async verify(email: string, code: string): Promise<VerifyResponse> {
    const response = await apiFetch<VerifyResponse>('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  async verifyToken(): Promise<{
    user: { email: string; firstName: string };
  } | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const response = await apiFetch<{
        success: boolean;
        user: { email: string; firstName: string };
      }>('/api/verify-token', {
        method: 'GET',
      });
      return { user: response.user };
    } catch {
      clearAuthToken();
      return null;
    }
  },
};

export const dataApi = {
  async getData(): Promise<UserData> {
    const response = await apiFetch<DataResponse>('/api/data', {
      method: 'GET',
    });
    return response.data;
  },

  async updateData(data: UserData): Promise<void> {
    const compressedData = compressData(data);

    await apiFetch('/api/data', {
      method: 'PUT',
      body: JSON.stringify({
        data,
        compressed: compressedData,
      }),
    });
  },

  async generateSchedule(availableMinutes?: number): Promise<UserData['schedule']> {
    const response = await apiFetch<ScheduleResponse>('/api/schedule/generate', {
      method: 'POST',
      body: JSON.stringify({ availableMinutes }),
    });
    return response.schedule;
  },
};

export const api = {
  auth: authApi,
  data: dataApi,
  setToken: setAuthToken,
  getToken: getAuthToken,
  clearToken: clearAuthToken,
  compress: compressData,
  decompress: decompressData,
};

export default api;
