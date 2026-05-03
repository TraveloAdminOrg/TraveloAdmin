import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import { authStorage } from "../lib/auth";
import type { Admin } from "../types/admin";
import type { LoginCredentials } from "../types/auth";

interface AuthContextValue {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<Admin>;
  logout: () => Promise<void>;
  hasType: (types: string | string[]) => boolean;
  hasPermission: (permissions: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(() =>
    authStorage.getUser<Admin>(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(authStorage.getToken()) && !authStorage.getUser<Admin>(),
  );

  // Hydrate admin on first load if we have a token but no cached admin.
  useEffect(() => {
    let cancelled = false;
    const token = authStorage.getToken();

    if (token && !admin) {
      authApi
        .me()
        .then((fresh) => {
          if (cancelled) return;
          authStorage.setUser(fresh);
          setAdmin(fresh);
        })
        .catch(() => {
          authStorage.clear();
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const res = await authApi.login(credentials);
    authStorage.setToken(res.accessToken);
    authStorage.setRefreshToken(res.refreshToken);
    authStorage.setUser(res.admin);
    setAdmin(res.admin);
    return res.admin;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore — we still clear local state on failure.
    } finally {
      authStorage.clear();
      setAdmin(null);
    }
  };

  const hasType = (types: string | string[]) => {
    if (!admin?.type) return false;
    const list = Array.isArray(types) ? types : [types];
    return list.includes(admin.type);
  };

  const hasPermission = (permissions: string | string[]) => {
    if (!admin?.permissions) return false;
    // Super admins implicitly have everything.
    if (admin.type === "super_admin") return true;
    const list = Array.isArray(permissions) ? permissions : [permissions];
    return list.every((p) => admin.permissions.includes(p));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      logout,
      hasType,
      hasPermission,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [admin, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
