'use client';

import useSWRMutation from 'swr/mutation';
import { deleteCoupon } from '@/repositories/coupons/coupon';
import { mutate } from 'swr';

export type RemoveCouponData = {
  id: string;
};

export function useRemoveCoupon() {
  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    'remove-coupon',
    async (_key, { arg }: { arg: RemoveCouponData }) => {
      const result = await deleteCoupon(arg.id);

      // Invalidate related caches after successful deletion
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
