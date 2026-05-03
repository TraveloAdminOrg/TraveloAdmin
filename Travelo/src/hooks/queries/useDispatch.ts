import { useQuery } from "@tanstack/react-query";
import { dispatchApi } from "../../api/dispatch.api";

export const dispatchKeys = {
  activeDrivers: ["dispatch", "active-drivers"] as const,
  activeRides: ["dispatch", "active-rides"] as const,
};

const REFRESH_INTERVAL = 15_000;

export const useActiveDriversQuery = () =>
  useQuery({
    queryKey: dispatchKeys.activeDrivers,
    queryFn: dispatchApi.activeDrivers,
    refetchInterval: REFRESH_INTERVAL,
  });

export const useActiveDispatchRidesQuery = () =>
  useQuery({
    queryKey: dispatchKeys.activeRides,
    queryFn: dispatchApi.activeRides,
    refetchInterval: REFRESH_INTERVAL,
  });
