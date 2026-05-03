import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  AppNotification,
  NotificationCreateInput,
} from "../types/notification";

interface ListEnvelope {
  notifications: AppNotification[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  notification: AppNotification;
}

export const notificationsApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.notifications.base, {
        params: { page, limit },
      })
      .then((r) => ({
        notifications: r.data.data.notifications ?? [],
        meta: r.data.data.meta,
      })),

  send: (data: NotificationCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.notifications.send, data)
      .then((r) => r.data.data.notification),
};
