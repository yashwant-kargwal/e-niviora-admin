import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { userService, type UserListParams } from "@/services/user.service";

export const userKeys = {
  all: ["users"] as const,

  lists: () => [...userKeys.all, "list"] as const,

  list: (params: UserListParams) => [...userKeys.lists(), params] as const,

  details: () => [...userKeys.all, "detail"] as const,

  detail: (id: string) => [...userKeys.details(), id] as const,

  me: () => [...userKeys.all, "me"] as const,
};

export const useUsers = (params: UserListParams) => {
  return useQuery({
    queryKey: userKeys.list(params),

    queryFn: () => userService.getUsers(params),

    placeholderData: (previousData) => previousData,
  });
};

export const useUser = (id?: string) => {
  return useQuery({
    queryKey: id ? userKeys.detail(id) : ["users", "detail", "empty"],

    queryFn: () => userService.getUser(id!),

    enabled: Boolean(id),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: userKeys.me(),

    queryFn: () => userService.getMe(),
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; phone?: string }) =>
      userService.updateMe(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.me(),
      });
    },
  });
};
