import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../api/dashboard.api";

export const dashboardKeys = {
  kpis: () => ["dashboard", "kpis"] as const,
  revenueTrend: () => ["dashboard", "revenue-trend"] as const,
  regionsOverview: () => ["dashboard", "regions-overview"] as const,
  ridesTrend: () => ["dashboard", "rides-trend"] as const,
  driverStatus: (region?: string) =>
    ["dashboard", "driver-status", region ?? "all"] as const,
  pendingApprovals: () => ["dashboard", "pending-approvals"] as const,
  reviewsNeedingAttention: () =>
    ["dashboard", "reviews-needing-attention"] as const,
  topDrivers: () => ["dashboard", "top-drivers"] as const,
  latestRides: () => ["dashboard", "latest-rides"] as const,
};

export const useDashboardKpisQuery = () =>
  useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: dashboardApi.kpis,
  });

export const useRevenueTrendQuery = () =>
  useQuery({
    queryKey: dashboardKeys.revenueTrend(),
    queryFn: dashboardApi.revenueTrend,
  });

export const useRegionsOverviewQuery = () =>
  useQuery({
    queryKey: dashboardKeys.regionsOverview(),
    queryFn: dashboardApi.regionsOverview,
  });

export const useRidesTrendQuery = () =>
  useQuery({
    queryKey: dashboardKeys.ridesTrend(),
    queryFn: dashboardApi.ridesTrend,
  });

export const useDriverStatusQuery = (region?: string) =>
  useQuery({
    queryKey: dashboardKeys.driverStatus(region),
    queryFn: () => dashboardApi.driverStatus(region),
  });

export const usePendingApprovalsQuery = () =>
  useQuery({
    queryKey: dashboardKeys.pendingApprovals(),
    queryFn: dashboardApi.pendingApprovals,
  });

export const useReviewsNeedingAttentionQuery = () =>
  useQuery({
    queryKey: dashboardKeys.reviewsNeedingAttention(),
    queryFn: dashboardApi.reviewsNeedingAttention,
  });

export const useTopDriversQuery = () =>
  useQuery({
    queryKey: dashboardKeys.topDrivers(),
    queryFn: dashboardApi.topDrivers,
  });

export const useLatestRidesQuery = () =>
  useQuery({
    queryKey: dashboardKeys.latestRides(),
    queryFn: dashboardApi.latestRides,
  });
