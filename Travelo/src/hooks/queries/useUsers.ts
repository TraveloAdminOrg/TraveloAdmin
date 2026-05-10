import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi, type UsersListParams } from "../../api/users.api";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: UsersListParams) => [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  regionCounts: () => [...userKeys.all, "region-counts"] as const,
};

export const useUsersQuery = (params: UsersListParams = {}) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useUserQuery = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });

export const useCustomerRegionCountsQuery = () =>
  useQuery({
    queryKey: userKeys.regionCounts(),
    queryFn: usersApi.regionCounts,
  });
