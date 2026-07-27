import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse, PaginationMeta } from "../types/api";
import type {
  Pricing,
  PricingCreateInput,
  PricingUpdateInput,
} from "../types/pricing";

// Backend wraps every response as `{ success, message, data: { ... } }`.
// GET /fare/?page=&limit= → `{ fares: Pricing[], meta }`.
interface ListEnvelope {
  fares: Pricing[];
  meta?: PaginationMeta;
}

interface SingleEnvelope {
  fare: Pricing;
}

// A fare document is one per region, so the whole collection is inherently tiny.
// We pull it in a single request and let the page filter + paginate client-side —
// that's what keeps the region tab counts and the pager consistent with each
// other. If fares ever outgrow this, add a server-side `?region=` filter.
const MAX_PAGE_SIZE = 100;

export const pricingsApi = {
  list: () =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.pricings.base, {
        params: { page: 1, limit: MAX_PAGE_SIZE },
      })
      .then((r) => r.data.data.fares ?? []),

  create: (data: PricingCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.pricings.base, data)
      .then((r) => r.data.data.fare),

  update: (id: string, data: PricingUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.pricings.byId(id), data)
      .then((r) => r.data.data.fare),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<{ id: string }>>(ENDPOINTS.pricings.byId(id))
      .then((r) => r.data.data.id),
};
