import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { reviewsApi, type ReviewsListParams } from "../../api/reviews.api";

export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (params: ReviewsListParams) =>
    [...reviewKeys.lists(), params] as const,
};

export const useReviewsQuery = (params: ReviewsListParams = {}) =>
  useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => reviewsApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.lists() }),
  });
};
