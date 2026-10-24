/**
 * Centralized API client for the Car Dealership backend.
 * Handles base URL configuration, JWT token injection, and response parsing.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Retrieve stored JWT token from localStorage */
export const getToken = (): string | null => localStorage.getItem('token');

/** Store JWT token in localStorage */
export const setToken = (token: string): void => localStorage.setItem('token', token);

/** Remove JWT token from localStorage */
export const clearToken = (): void => localStorage.removeItem('token');

/**
 * Makes an authenticated fetch request, injecting the JWT token if available.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const message = data.message || `HTTP ${res.status}`;
    const err = new Error(message) as Error & { status: number; data: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ─── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    role?: string;
    adminCode?: string;
  }) => apiFetch<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  login: (body: { email: string; password: string }) =>
    apiFetch<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () =>
    apiFetch<{ success: boolean; data: { user: User } }>('/auth/me'),
};

// ─── Vehicle endpoints ─────────────────────────────────────────────────────────

export const vehicleApi = {
  getAll: (page = 1, limit = 12) =>
    apiFetch<{ success: boolean; data: PaginatedVehicles }>(`/vehicles?page=${page}&limit=${limit}`),

  search: (params: SearchFilters) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.set(k, String(v));
    });
    return apiFetch<{ success: boolean; data: PaginatedVehicles }>(`/vehicles/search?${q}`);
  },

  getById: (id: number) =>
    apiFetch<{ success: boolean; data: { vehicle: Vehicle } }>(`/vehicles/${id}`),

  create: (body: VehicleFormData) =>
    apiFetch<{ success: boolean; data: { vehicle: Vehicle } }>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: number, body: Partial<VehicleFormData>) =>
    apiFetch<{ success: boolean; data: { vehicle: Vehicle } }>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    apiFetch<{ success: boolean; message: string }>(`/vehicles/${id}`, { method: 'DELETE' }),

  purchase: (id: number, quantity: number) =>
    apiFetch<{ success: boolean; message: string; data: { vehicle: Vehicle } }>(
      `/vehicles/${id}/purchase`,
      { method: 'POST', body: JSON.stringify({ quantity }) }
    ),

  restock: (id: number, quantity: number) =>
    apiFetch<{ success: boolean; message: string; data: { vehicle: Vehicle } }>(
      `/vehicles/${id}/restock`,
      { method: 'POST', body: JSON.stringify({ quantity }) }
    ),
};

// ─── Types (re-exported for convenience) ──────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  price: number;
  quantity: number;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  price: number;
  quantity: number;
  description: string;
  image_url: string;
}

export type VehicleCategory = 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Van' | 'Electric' | 'Hybrid';

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: VehicleCategory;
  minPrice?: number | string;
  maxPrice?: number | string;
  page?: number;
  limit?: number;
}
