export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
  adminCode?: string;
}

export type VehicleCategory = 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Van' | 'Electric' | 'Hybrid';

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: VehicleCategory;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
