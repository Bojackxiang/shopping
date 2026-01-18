"use client";

import { fetchCurrentCustomerAction } from "@/app/actions";
import type { SerializableCustomerBasicInfo } from "@/repo/customer.repo";
import useSWR from "swr";

export const useCustomer = () => {
  const { data, error, isLoading, mutate } =
    useSWR<SerializableCustomerBasicInfo | null>(
      "current-customer",
      async () => {
        const result = await fetchCurrentCustomerAction();

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
