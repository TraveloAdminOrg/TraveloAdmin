import { useQuery } from "@tanstack/react-query";
import { dispatchApi } from "../../api/dispatch.api";

export const dispatchKeys = {
  overview: (region?: string) =>
    ["dispatch", "overview", region ?? "all"] as const,
  activeDrivers: (region?: string) =>
    ["dispatch", "active-drivers", region ?? "all"] as const,
  activeRides: (region?: string) =>
    ["dispatch", "active-rides", region ?? "all"] as const,
};

const REFRESH_INTERVAL = 15_000;

export const useDispatchOverviewQuery = (region?: string) =>
  useQuery({
    queryKey: dispatchKeys.overview(region),
    queryFn: () => dispatchApi.overview(region),
    refetchInterval: REFRESH_INTERVAL,
  });

// Returns the unwrapped drivers array so existing call sites stay compatible.
export const useActiveDriversQuery = (region?: string) =>
  useQuery({
    queryKey: dispatchKeys.activeDrivers(region),
    queryFn: async () => (await dispatchApi.activeDrivers(region)).drivers ?? [],
    refetchInterval: REFRESH_INTERVAL,
  });

// Returns the unwrapped rides array so existing call sites stay compatible.
export const useActiveDispatchRidesQuery = (region?: string) =>
  useQuery({
    queryKey: dispatchKeys.activeRides(region),
    queryFn: async () => (await dispatchApi.activeRides(region)).rides ?? [],
    refetchInterval: REFRESH_INTERVAL,
  });
