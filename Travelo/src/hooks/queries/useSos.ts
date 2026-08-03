import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { sosApi } from "../../api/sos.api";
import type { SosListParams } from "../../types/sos";

export const sosKeys = {
  all: ["sos"] as const,
  lists: () => [...sosKeys.all, "list"] as const,
  list: (params: SosListParams) => [...sosKeys.lists(), params] as const,
  active: () => [...sosKeys.all, "active"] as const,
  detail: (id: string) => [...sosKeys.all, "detail", id] as const,
};

export const useSosSessionsQuery = (params: SosListParams = {}) =>
  useQuery({
    queryKey: sosKeys.list(params),
    queryFn: () => sosApi.list(params),
    placeholderData: keepPreviousData,
  });

// The live queue is driven by sockets, not polling — this query only seeds it on
// mount and after a reconnect (see SosContext). A slow poll is kept as a
// belt-and-braces backstop for a socket that silently stops delivering; for an
// emergency feature a stale queue is worse than a redundant request.
export const useActiveSosQuery = (enabled = true) =>
  useQuery({
    queryKey: sosKeys.active(),
    queryFn: () => sosApi.active(),
    enabled,
    refetchInterval: 60_000,
    staleTime: 0,
  });

export const useSosSessionQuery = (id: string | null) =>
  useQuery({
    queryKey: sosKeys.detail(id ?? ""),
    queryFn: () => sosApi.getById(id as string),
    enabled: Boolean(id),
  });
