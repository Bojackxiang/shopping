'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { createCoupon } from '@/repositories/coupons/coupon';
import { CouponType } from '@prisma/client';
import { delay } from '@/utils/delay';

export type CreateCouponData = {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startDate: Date;
  endDate: Date;
};

export type UseCreateCouponReturn = {
  // 状态
  isLoading: boolean;
  error: Error | null;

  // 方法
  trigger: (data: CreateCouponData) => Promise<void>;
  reset: () => void;

  // 表单相关的额外状态
  isSuccess: boolean;
  isError: boolean;
};

export function useCreateCoupon(): UseCreateCouponReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const trigger = async (createData: CreateCouponData) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await delay(1000);
      await createCoupon(createData);

      setIsSuccess(true);

      await mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/coupons'),
        undefined,
        { revalidate: true }
      );

      await mutate(['coupons', { page: 1 }]);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('创建优惠券失败');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  };

  return {
    // 基本状态
    isLoading,
    error,

    // 方法
    trigger,
    reset,

    // 表单友好的状态
    isSuccess,
    isError: !!error
  };
}
