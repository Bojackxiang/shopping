'use client';

import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { updateOrder } from '@/repositories/order/order.repo';
import { UpdateOrderData } from '@/repositories/order/order.type';

export function useUpdateOrder() {
  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    'update-order',
    async (_key, { arg }: { arg: UpdateOrderData }) => {
      const result = await updateOrder(arg);

      // Invalidate related caches after successful mutation
      await mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/orders'),
        undefined,
        { revalidate: true }
      );

      // Invalidate orders list cache
      await mutate(['orders', { page: 1 }]);

      // Invalidate specific order cache
      await mutate(['order', arg.id]);

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
