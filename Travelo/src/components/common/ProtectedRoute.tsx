import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredTypes?: string[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({
  children,
  requiredTypes,
  requiredPermissions,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasType, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner fullPage label="Loading…" />;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (requiredTypes?.length && !hasType(requiredTypes)) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermissions?.length && !hasPermission(requiredPermissions)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
