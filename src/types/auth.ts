export type UserRole = "ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}

export interface AdminSignupDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AdminSignupResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
