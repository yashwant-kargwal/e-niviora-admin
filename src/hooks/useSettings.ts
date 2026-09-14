import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { settingService } from "@/services/setting.service";

import type { UpdateSettingPayload } from "@/types/setting";

export const settingKeys = {
  all: ["settings"] as const,
  default: () => [...settingKeys.all, "default"] as const,
};

export const useDefaultSetting = () => {
  return useQuery({
    queryKey: settingKeys.default(),
    queryFn: () => settingService.getDefaultSetting(),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingPayload) =>
      settingService.updateSetting(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingKeys.default(),
      });
    },
  });
};
