import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ridesApi, type RidesListParams } from "../../api/rides.api";
import type { PaginationParams } from "../../types/api";

export const rideKeys = {
  all: ["rides"] as const,
  lists: () => [...rideKeys.all, "list"] as const,
  list: (params: RidesListParams) => [...rideKeys.lists(), params] as const,
  detail: (id: string) => [...rideKeys.all, "detail", id] as const,
  active: () => [...rideKeys.all, "active"] as const,
  byUser: (userId: string, params: PaginationParams) =>
    [...rideKeys.all, "by-user", userId, params] as const,
  byDriver: (driverId: string, params: PaginationParams) =>
    [...rideKeys.all, "by-driver", driverId, params] as const,
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

export const useRidesByUserQuery = (
  userId: string,
  params: PaginationParams = {},
) =>
  useQuery({
    queryKey: rideKeys.byUser(userId, params),
    queryFn: () => ridesApi.byUser(userId, params),
    enabled: !!userId,
    placeholderData: keepPreviousData,
  });

export const useRidesByDriverQuery = (
  driverId: string,
  params: PaginationParams = {},
) =>
  useQuery({
    queryKey: rideKeys.byDriver(driverId, params),
    queryFn: () => ridesApi.byDriver(driverId, params),
    enabled: !!driverId,
    placeholderData: keepPreviousData,
  });

export const useActiveRidesQuery = (refetchMs = 15_000) =>
  useQuery({
    queryKey: rideKeys.active(),
    queryFn: ridesApi.active,
    refetchInterval: refetchMs,
  });

export const useForceCancelRideMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      cancellationReason,
    }: {
      id: string;
      cancellationReason?: string;
    }) => ridesApi.cancel(id, cancellationReason),
    onSuccess: (_id, { id }) => {
      qc.invalidateQueries({ queryKey: rideKeys.lists() });
      qc.invalidateQueries({ queryKey: rideKeys.detail(id) });
      qc.invalidateQueries({ queryKey: rideKeys.active() });
    },
  });
};
