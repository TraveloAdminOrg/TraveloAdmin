import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsApi } from "../../api/notifications.api";
import type { PaginationParams } from "../../types/api";
import type { NotificationCreateInput } from "../../types/notification";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...notificationKeys.lists(), params] as const,
};

export const useNotificationsQuery = (params: PaginationParams = {}) =>
  useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useSendNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationCreateInput) => notificationsApi.send(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: notificationKeys.lists() }),
  });
};
