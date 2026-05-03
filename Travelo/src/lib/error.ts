import { AxiosError } from "axios";
import type { ApiError } from "../types/api";

export function parseApiError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const data = err.response?.data as Partial<ApiError> | undefined;
    return {
      message:
        data?.message ||
        err.message ||
        "Something went wrong. Please try again.",
      status: err.response?.status,
      code: data?.code,
      errors: data?.errors,
    };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: "Unknown error" };
}

export const getErrorMessage = (err: unknown): string => parseApiError(err).message;

/**
 * Returns true when the error is a 404 from a request the frontend made —
 * useful for distinguishing "endpoint not implemented yet" from other failures.
 */
export const isNotFoundError = (err: unknown): boolean =>
  err instanceof AxiosError && err.response?.status === 404;
