import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi, type ContentItem } from "../../api/content.api";

export const contentKeys = {
  all: ["content"] as const,
  list: () => [...contentKeys.all, "list"] as const,
  detail: (id: string) => [...contentKeys.all, "detail", id] as const,
};

export const useContentQuery = () =>
  useQuery({ queryKey: contentKeys.list(), queryFn: contentApi.list });

export const useContentItemQuery = (id: string) =>
  useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => contentApi.getById(id),
    enabled: !!id,
  });

export const useCreateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContentItem>) => contentApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.list() }),
  });
};

export const useUpdateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      contentApi.update(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: contentKeys.list() });
      qc.invalidateQueries({ queryKey: contentKeys.detail(vars.id) });
    },
  });
};

export const useDeleteContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.list() }),
  });
};
