import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

// TODO: Replace `unknown` with a real ContentItem type once the backend shape is known.
export interface ContentItem {
  id: string;
  title: string;
  slug?: string;
  body?: string;
  status?: "draft" | "published";
  updatedAt?: string;
}

export const contentApi = {
  list: () =>
    apiClient.get<ContentItem[]>(ENDPOINTS.content.base).then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ContentItem>(ENDPOINTS.content.byId(id))
      .then((r) => r.data),

  create: (data: Partial<ContentItem>) =>
    apiClient.post<ContentItem>(ENDPOINTS.content.base, data).then((r) => r.data),

  update: (id: string, data: Partial<ContentItem>) =>
    apiClient
      .patch<ContentItem>(ENDPOINTS.content.byId(id), data)
      .then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(ENDPOINTS.content.byId(id)).then((r) => r.data),
};
