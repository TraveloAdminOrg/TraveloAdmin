import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { Review } from "../types/review";

interface ListEnvelope {
  reviews: Review[];
  meta: PaginationMeta;
}

export interface ReviewsListParams extends PaginationParams {
  minRating?: number;
  maxRating?: number;
}

export const reviewsApi = {
  list: (params: ReviewsListParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.reviews.base, { params })
      .then((r) => ({
        reviews: r.data.data.reviews ?? [],
        meta: r.data.data.meta,
      })),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<{ id: string }>>(ENDPOINTS.reviews.byId(id))
      .then((r) => r.data.data),
};
