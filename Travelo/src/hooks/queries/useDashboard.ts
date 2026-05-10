import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../api/dashboard.api";

export const dashboardKeys = {
  kpis: () => ["dashboard", "kpis"] as const,
};

export const useDashboardKpisQuery = () =>
  useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: dashboardApi.kpis,
  });
