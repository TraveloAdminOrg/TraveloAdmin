import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type {
  Advert,
  AdvertCreateInput,
  AdvertUpdateInput,
} from "../types/advert";

interface ListEnvelope {
  adverts: Advert[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  advert: Advert;
}

export const advertsApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.adverts.base, {
        params: { page, limit },
      })
      .then((r) => ({
        adverts: r.data.data.adverts ?? [],
        meta: r.data.data.meta,
      })),

  create: (data: AdvertCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.adverts.base, data)
      .then((r) => r.data.data.advert),

  update: (id: string, data: AdvertUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.adverts.byId(id), data)
      .then((r) => r.data.data.advert),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(ENDPOINTS.adverts.byId(id))
      .then((r) => r.data),
};
