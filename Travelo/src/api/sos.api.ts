import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type { ApiResponse, PaginationMeta } from "../types/api";
import type { SosListParams, SosSession } from "../types/sos";

// Backend wraps every response as `{ success, message, data: { ... } }`.
interface ListEnvelope {
  sosSessions: SosSession[];
  meta: PaginationMeta;
}

interface ActiveEnvelope {
  sosSessions: SosSession[];
}

interface SingleEnvelope {
  sos: SosSession;
}

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export const sosApi = {
  list: ({ page = 1, limit = 10, status, region }: SosListParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.sos.base, {
        params: { page, limit, ...(status && { status }), ...(region && { region }) },
      })
      .then((r) => ({
        sosSessions: r.data.data.sosSessions ?? [],
        meta: r.data.data.meta,
      })),

  // Open sessions. Used on mount and after a socket reconnect so an alert raised
  // while this tab was disconnected is not lost.
  active: () =>
    apiClient
      .get<ApiResponse<ActiveEnvelope>>(ENDPOINTS.sos.active)
      .then((r) => r.data.data.sosSessions ?? []),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.sos.byId(id))
      .then((r) => r.data.data.sos),

  // Claims the session. Racing operators are resolved server-side: exactly one
  // caller gets a 200 and the rest get 409.
  accept: (id: string) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.sos.accept(id))
      .then((r) => r.data.data.sos),

  end: (id: string) =>
    apiClient
      .post<ApiResponse<SingleEnvelope>>(ENDPOINTS.sos.end(id))
      .then((r) => r.data.data.sos),

  iceServers: () =>
    apiClient
      .get<ApiResponse<{ iceServers: IceServer[] }>>(ENDPOINTS.sos.iceServers)
      .then((r) => r.data.data.iceServers ?? []),
};
