import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  categoryService,
  type CategoryListParams,
} from "@/services/category.service";

import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";

const categoryKeys = {
  all: ["categories"] as const,

  lists: () => [...categoryKeys.all, "list"] as const,

  list: (params: CategoryListParams) =>
    [...categoryKeys.lists(), params] as const,

  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
};

export const useCategories = (params: CategoryListParams) => {
  return useQuery({
    queryKey: categoryKeys.list(params),

    queryFn: () => categoryService.getCategories(params),

    placeholderData: (previousData) => previousData,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoryService.createCategory(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCategoryPayload;
    }) => categoryService.updateCategory(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.toggleCategoryStatus(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
  });
};
