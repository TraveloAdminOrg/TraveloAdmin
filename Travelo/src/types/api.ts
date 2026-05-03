// Generic shapes used by the HTTP layer. Adjust to match your real backend.

// Standard envelope used by the Travelo backend.
// e.g. { success: true, message: "...", data: { ... } }
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Server-side pagination metadata returned alongside list payloads.
export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

// Query params we send to paginated list endpoints.
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Generic envelope for list endpoints that haven't been wired up yet.
export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}
