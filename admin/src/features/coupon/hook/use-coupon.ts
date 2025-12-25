'use client';

import { delay } from '@/constants/mock-api';
import { CouponListParams, getCoupons } from '@/repositories/coupons/coupon';
import useSWR from 'swr';

export const useCoupon = (params?: CouponListParams) => {
  const swrKey = params ? ['coupons', JSON.stringify(params)] : 'coupons';

  const swrData = useSWR(
    swrKey,
    async () => {
      await delay(1000);
      return await getCoupons(params || {});
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  );

  const totalPages = swrData.data
    ? Math.ceil(swrData.data.total / (params?.pageSize || 10))
    : 0;

  return {
    // data fetching state
    ...swrData,
    data: swrData?.data,
    items: swrData?.data?.items || [],
    total: swrData?.data?.total || 0,
    page: swrData?.data?.page || 1,
    pageSize: swrData?.data?.pageSize || 10,
    totalPages,
    isLoading: swrData.isLoading,
    isValidating: swrData.isValidating
  };
};

export default useCoupon;
