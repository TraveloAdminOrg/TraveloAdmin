import type { Admin } from "./admin";

export interface LoginCredentials {
  email: string;
  password: string;
}

// Inner `data` payload of the /admin/sign response.
export interface LoginResponse {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
