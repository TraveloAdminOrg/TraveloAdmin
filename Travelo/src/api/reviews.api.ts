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
  direction?: string;
  minRating?: number;
  maxRating?: number;
  flagged?: boolean;
}

export const reviewsApi = {
  list: (params: ReviewsListParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.reviews.base, { params })
      .then((r) => ({
        reviews: r.data.data.reviews ?? [],
        meta: r.data.data.meta,
      })),

  hide: (id: string) =>
    apiClient
      .patch<ApiResponse<{ review: Review }>>(ENDPOINTS.reviews.byId(id), {
        isHidden: true,
      })
      .then((r) => r.data.data.review),

  unhide: (id: string) =>
    apiClient
      .patch<ApiResponse<{ review: Review }>>(ENDPOINTS.reviews.byId(id), {
        isHidden: false,
      })
      .then((r) => r.data.data.review),
};
