'use client';

import useSWRMutation from 'swr/mutation';
import { toggleCouponStatus } from '@/repositories/coupons/coupon';
import { mutate } from 'swr';

export type ToggleCouponActiveData = {
  id: string;
  isActive: boolean;
};

export function useActiveCoupon() {
  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    'toggle-coupon-status',
    async (_key, { arg }: { arg: ToggleCouponActiveData }) => {
      const result = await toggleCouponStatus(arg.id, arg.isActive);

      // Invalidate related caches after successful mutation
      await mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/coupons'),
        undefined,
        { revalidate: true }
      );

      await mutate(['coupons', { page: 1 }]);
      await mutate(['coupon', arg.id]);

      return result;
    }
  );

  return {
    trigger,
    isLoading: isMutating,
    error,
    data,
    reset
  };
}
