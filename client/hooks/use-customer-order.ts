"use client";

import { fetchUserOrdersByPageAction } from "@/app/actions";
import type { PaginatedOrderResponse } from "@/repo/order.repo";
import useSWR from "swr";

interface UseCustomerOrderParams {
  page?: number;
  limit?: number;
}

/**
 * Custom hook to fetch paginated customer orders
 * @param page - Page number (default: 1)
 * @param limit - Number of orders per page (default: 10)
 * @returns SWR response with paginated orders data
 */
export const useCustomerOrder = (params?: UseCustomerOrderParams) => {
  const { page = 1, limit = 10 } = params || {};

  const { data, error, isLoading, mutate } = useSWR<PaginatedOrderResponse>(
    `customer-orders?page=${page}&limit=${limit}`,
    async () => {
      const response = await fetchUserOrdersByPageAction(page, limit);

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data!;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    orders: data?.orders ?? [],
    pagination: data?.pagination,
    error,
    isLoading,
    mutate,
  };
};
