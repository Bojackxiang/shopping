'use client';

import useSWR from 'swr';
import { getRecentSales } from '@/repositories/order/order.repo';

export type RecentSale = {
  id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
  customer: {
    id: string;
    email: string;
    name: string;
    imageUrl: string | null;
  } | null;
};

export function useRecentSales(limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR<RecentSale[]>(
    ['recent-sales', limit],
    () => getRecentSales(limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    sales: data || [],
    isLoading,
    error,
    refresh: mutate
  };
}
