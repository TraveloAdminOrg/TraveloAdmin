import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ridesApi, type RidesListParams } from "../../api/rides.api";

export const rideKeys = {
  all: ["rides"] as const,
  lists: () => [...rideKeys.all, "list"] as const,
  list: (params: RidesListParams) => [...rideKeys.lists(), params] as const,
  detail: (id: string) => [...rideKeys.all, "detail", id] as const,
  active: () => [...rideKeys.all, "active"] as const,
};

export const useRidesQuery = (params: RidesListParams = {}) =>
  useQuery({
    queryKey: rideKeys.list(params),
    queryFn: () => ridesApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useRideQuery = (id: string) =>
  useQuery({
    queryKey: rideKeys.detail(id),
    queryFn: () => ridesApi.getById(id),
    enabled: !!id,
  });

export const useActiveRidesQuery = (refetchMs = 15_000) =>
  useQuery({
    queryKey: rideKeys.active(),
    queryFn: ridesApi.active,
    refetchInterval: refetchMs,
  });
