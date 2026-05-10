import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse } from "../types/api";

export interface ContentItem {
  _id: string;
  type: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SingleEnvelope {
  content: ContentItem;
}

export const contentApi = {
  // GET /content/get?type=xxx
  get: (type: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.content.get, {
        params: { type },
      })
      .then((r) => r.data.data.content),

  // POST /content/add  body: { type, text }
  create: (data: { type: string; text: string }) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.content.add, data)
      .then((r) => r.data.data.content),

  // PATCH /content/edit?type=xxx  body: { text }
  update: (type: string, text: string) =>
    apiClient
      .patch<ApiResponse<SingleEnvelope>>(
        ENDPOINTS.content.edit,
        { text },
        { params: { type } },
      )
      .then((r) => r.data.data.content),

  // DELETE /content/delete?type=xxx
  remove: (type: string) =>
    apiClient
      .delete<ApiResponse<SingleEnvelope>>(ENDPOINTS.content.remove, {
        params: { type },
      })
      .then((r) => r.data.data.content),
};
