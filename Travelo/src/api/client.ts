import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../lib/auth";
import { reconnectSocket } from "../lib/socket";
import { ENDPOINTS } from "./endpoints";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!baseURL) {
  console.warn(
    "[api] VITE_API_BASE_URL is not set. Create a .env file at the project root.",
  );
}

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

// --- Request interceptor: attach Bearer token ----------------------------
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: refresh-on-401, then redirect to /signin ------
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string | null> | null = null;

interface RefreshEnvelope {
  success: boolean;
  message: string;
  // TODO: confirm refresh response shape — assuming same envelope as /admin/sign.
  data: { accessToken: string; refreshToken?: string };
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Bare axios call to avoid an interceptor loop.
    const res = await axios.post<RefreshEnvelope>(
      `${baseURL}${ENDPOINTS.auth.refresh}`,
      { refreshToken },
    );
    const { accessToken, refreshToken: newRefresh } = res.data.data;
    authStorage.setToken(accessToken);
    if (newRefresh) authStorage.setRefreshToken(newRefresh);
    // The live socket's handshake still carries the old token — reconnect it
    // now, otherwise it keeps retrying forever against a rejected handshake.
    reconnectSocket();
    return accessToken;
  } catch {
    return null;
  }
}

// Endpoints that must never trigger the refresh-on-401 dance —
// a 401 from these means "bad credentials" or "expired refresh token",
// not "access token expired".
const AUTH_ENDPOINTS_NO_RETRY = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.refresh,
];

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS_NO_RETRY.some((e) => url.endsWith(e));
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    const shouldTryRefresh =
      status === 401 &&
      !!original &&
      !original._retried &&
      !isAuthEndpoint(original.url) &&
      !!authStorage.getRefreshToken();

    if (shouldTryRefresh && original) {
      original._retried = true;

      // Coalesce parallel refresh calls into one request.
      refreshPromise ??= tryRefresh().finally(() => {
        refreshPromise = null;
      });

      const newToken = await refreshPromise;

      if (newToken) {
        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(original);
      }

      // Refresh failed → clear session and bounce to sign-in.
      authStorage.clear();
      if (window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  },
);
