import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";
import type {
  ApiResponse,
  PaginationMeta,
  PaginationParams,
} from "../types/api";
import type { Driver, DriverDocuments } from "../types/driver";

// `/admin/drivers/:id` returns the driver with `driverDocuments` nested inside.
interface SingleEnvelope {
  driver: Driver;
}

// `/admin/drivers/?page=&limit=` returns each entry as a wrapper object so we
// can correlate the driver row with its (separately-loaded) documents.
interface ListEntry {
  driver: Omit<Driver, "driverDocuments">;
  driverDocuments?: DriverDocuments;
}

interface ListEnvelope {
  drivers: ListEntry[];
  meta: PaginationMeta;
}

export interface DriversListResult {
  drivers: Driver[];
  meta: PaginationMeta;
}

export const driversApi = {
  list: ({ page = 1, limit = 10 }: PaginationParams = {}) =>
    apiClient
      .get<ApiResponse<ListEnvelope>>(ENDPOINTS.drivers.base, {
        params: { page, limit },
      })
      .then((r) => {
        // Flatten { driver, driverDocuments } so consumers see a Driver[]
        // identical in shape to what `getById` returns.
        const drivers: Driver[] = (r.data.data.drivers ?? []).map((entry) => ({
          ...entry.driver,
          driverDocuments: entry.driverDocuments,
        }));
        return { drivers, meta: r.data.data.meta };
      }),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<SingleEnvelope>>(ENDPOINTS.drivers.byId(id))
      .then((r) => r.data.data.driver),
};
