import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { contentApi } from "../../api/content.api";

export const contentKeys = {
  all: ["content"] as const,
  byType: (type: string) => [...contentKeys.all, type] as const,
};

// Returns null (not throws) when the type doesn't exist yet, so the UI can
// show an "empty / create" state instead of an error.
export const useContentByTypeQuery = (type: string | null) =>
  useQuery({
    queryKey: contentKeys.byType(type ?? ""),
    enabled: !!type,
    queryFn: async () => {
      try {
        return await contentApi.get(type as string);
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

export const useCreateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; text: string }) =>
      contentApi.create(data),
    onSuccess: (data, vars) => {
      // Seed the cache immediately so the UI flips from "Not created" to the
      // saved content without waiting for a refetch round-trip.
      qc.setQueryData(contentKeys.byType(vars.type), data);
    },
  });
};

export const useUpdateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, text }: { type: string; text: string }) =>
      contentApi.update(type, text),
    onSuccess: (data, vars) => {
      qc.setQueryData(contentKeys.byType(vars.type), data);
    },
  });
};

export const useDeleteContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: string) => contentApi.remove(type),
    onSuccess: (_d, type) => {
      // Reflect the deletion locally so the page swaps to the empty state.
      qc.setQueryData(contentKeys.byType(type), null);
    },
  });
};
