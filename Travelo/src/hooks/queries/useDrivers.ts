import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { driversApi } from "../../api/drivers.api";
import type { PaginationParams } from "../../types/api";

export const driverKeys = {
  all: ["drivers"] as const,
  lists: () => [...driverKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...driverKeys.lists(), params] as const,
  detail: (id: string) => [...driverKeys.all, "detail", id] as const,
};

export const useDriversQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => driversApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useDriverQuery = (id: string) =>
  useQuery({
    queryKey: driverKeys.detail(id),
    queryFn: () => driversApi.getById(id),
    enabled: !!id,
  });
