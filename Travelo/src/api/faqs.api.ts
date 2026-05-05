import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";
import type { Faq, FaqCreateInput, FaqUpdateInput } from "../types/faq";

// Backend wraps every response as `{ success, message, data: { ... } }`.
// GET /faq/ → `{ faq: Faq[] }` (singular envelope key, plural payload).
interface ListEnvelope {
  faq: Faq[];
}

interface SingleEnvelope {
  faq: Faq;
}

export const faqsApi = {
  list: () =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.faqs.base)
      .then((r) => r.data.data.faq ?? []),

  create: (data: FaqCreateInput) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.faqs.base, data)
      .then((r) => r.data.data.faq),

  update: (id: string, data: FaqUpdateInput) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(ENDPOINTS.faqs.byId(id), data)
      .then((r) => r.data.data.faq),

  // DELETE returns the just-removed FAQ under `data.faq` (not { id }).
  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<SingleEnvelope>>(ENDPOINTS.faqs.byId(id))
      .then((r) => r.data.data.faq),
};
