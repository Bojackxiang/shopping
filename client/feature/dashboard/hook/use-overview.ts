"use client";

import { fetchUserRecentOrderAction } from "@/app/actions/order.action";
import useSWR from "swr";

export const useOverview = () => {
  const { data, error, isLoading, mutate } = useSWR(
    "dashboard/overview",
    async () => {
      const result = await fetchUserRecentOrderAction();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};
