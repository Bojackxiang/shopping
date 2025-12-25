'use client';

import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { updateCoupon } from '@/repositories/coupons/coupon';
import { CouponType } from '@prisma/client';

export type UpdateCouponData = {
  id: string;
  description?: string;
  type?: CouponType;
  value?: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
};

export function useUpdateCoupon() {
  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    'update-coupon',
    async (_key, { arg }: { arg: UpdateCouponData }) => {
      const { id, ...updateData } = arg;
      const result = await updateCoupon(id, updateData);

      // Invalidate related caches after successful mutation
      await mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/coupons'),
        undefined,
        { revalidate: true }
      );

      await mutate(['coupons', { page: 1 }]);
      await mutate(['coupon', id]);

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
