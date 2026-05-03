import { useQuery } from "@tanstack/react-query";
import { reportsApi, type ReportRangeParams } from "../../api/reports.api";

export const reportKeys = {
  overview: (params: ReportRangeParams) =>
    ["reports", "overview", params] as const,
  revenue: (params: ReportRangeParams) =>
    ["reports", "revenue", params] as const,
  rides: (params: ReportRangeParams) =>
    ["reports", "rides", params] as const,
  drivers: (params: ReportRangeParams) =>
    ["reports", "drivers", params] as const,
};

export const useReportOverviewQuery = (params: ReportRangeParams = {}) =>
  useQuery({
    queryKey: reportKeys.overview(params),
    queryFn: () => reportsApi.overview(params),
  });

export const useRevenueReportQuery = (params: ReportRangeParams = {}) =>
  useQuery({
    queryKey: reportKeys.revenue(params),
    queryFn: () => reportsApi.revenue(params),
  });

export const useRidesReportQuery = (params: ReportRangeParams = {}) =>
  useQuery({
    queryKey: reportKeys.rides(params),
    queryFn: () => reportsApi.rides(params),
  });

export const useDriversReportQuery = (params: ReportRangeParams = {}) =>
  useQuery({
    queryKey: reportKeys.drivers(params),
    queryFn: () => reportsApi.drivers(params),
  });
