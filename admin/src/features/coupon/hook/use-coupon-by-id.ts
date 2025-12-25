'use client';

import { delay } from '@/constants/mock-api';
import { getCouponById } from '@/repositories/coupons/coupon';
import useSWR from 'swr';

export const useCouponById = (id: string | null) => {
  const swrData = useSWR(
    id ? ['coupon', id] : null,
    async () => {
      if (!id) return null;
      await delay(500);
      return await getCouponById(id);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  );

  return {
    ...swrData,
    coupon: swrData.data,
    isLoading: swrData.isLoading,
    isValidating: swrData.isValidating
  };
};

export default useCouponById;
