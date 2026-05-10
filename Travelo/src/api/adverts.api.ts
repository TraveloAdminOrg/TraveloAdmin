import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { Advert, AdvertFormInput } from "../types/advert";

interface ListEnvelope {
  ads: Advert[];
  meta: PaginationMeta;
}

interface SingleEnvelope {
  ad: Advert;
}

// Backend expects multipart/form-data; image is an optional File.
// Booleans/numbers are stringified — that's how multipart parsers receive them.
function buildFormData(input: AdvertFormInput): FormData {
  const fd = new FormData();
  fd.append("title", input.title);
  fd.append("priority", String(input.priority));
  fd.append("isActive", String(input.isActive));
  if (input.description !== undefined) fd.append("description", input.description);
  if (input.actionLink !== undefined) fd.append("actionLink", input.actionLink);
  if (input.altText !== undefined) fd.append("altText", input.altText);
  if (input.image) fd.append("image", input.image);
  return fd;
}

export const advertsApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.adverts.base, {
        params: { page, limit },
      })
      .then((r) => ({
        adverts: r.data.data.ads ?? [],
        meta: r.data.data.meta,
      })),

  create: (data: AdvertFormInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(
        ENDPOINTS.adverts.base,
        buildFormData(data),
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((r) => r.data.data.ad),

  update: (id: string, data: AdvertFormInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(
        ENDPOINTS.adverts.byId(id),
        buildFormData(data),
        { headers: { "Content-Type": "multipart/form-data" } },
      )
      .then((r) => r.data.data.ad),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<SingleEnvelope>>(ENDPOINTS.adverts.byId(id))
      .then((r) => r.data.data.ad),
};
