import { useQuery } from "@tanstack/react-query";

import {
  dashboardService,
  type DashboardParams,
} from "@/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"] as const,

  detail: (params?: DashboardParams) =>
    [...dashboardKeys.all, params ?? {}] as const,
};

export const useDashboard = (params?: DashboardParams) => {
  return useQuery({
    queryKey: dashboardKeys.detail(params),

    queryFn: () => dashboardService.getDashboard(params),

    staleTime: 60 * 1000,

    refetchOnWindowFocus: false,
  });
};
