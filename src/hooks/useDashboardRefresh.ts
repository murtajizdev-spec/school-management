import { useCallback } from "react";
import { useSWRConfig } from "swr";

const CORE_KEYS = ["/api/dashboard/overview", "/api/fees/summary"];

export const useDashboardRefresh = () => {
  const { mutate } = useSWRConfig();

  const refreshDashboard = useCallback(
    async (additionalKeys: string[] = []) => {
      const keys = Array.from(new Set([...CORE_KEYS, ...additionalKeys]));
      await Promise.all(keys.map((key) => mutate(key)));
    },
    [mutate]
  );

  return { refreshDashboard };
};

