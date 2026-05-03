import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type { LoginCredentials, LoginResponse } from "../types/auth";
import type { Admin } from "../types/admin";

// Backend wraps every response as { success, message, data }.
// We unwrap `.data.data` so callers always receive the inner payload.
export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient
      .post<ApiResponse<LoginResponse>>(ENDPOINTS.auth.login, credentials)
      .then((r) => r.data.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.auth.logout).then((r) => r.data),

  me: () =>
    apiClient
      .get<ApiResponse<Admin>>(ENDPOINTS.auth.me)
      .then((r) => r.data.data),
};
