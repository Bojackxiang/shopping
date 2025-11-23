'use client';

import useSWRMutation from 'swr/mutation';
import { updateProduct } from '@/repositories';
import { UpdateProductInput } from '@/repositories/product/product.types';
import { mutate } from 'swr';

interface UseUpdateProductDataProps {
  productId: string;
}

interface UpdateProductArgs {
  arg: UpdateProductInput;
}

interface UseUpdateProductCategoryDataProps {
  productId: string;
  categories: Array<{ id: string; name: string }>;
}

const useUpdateProductData = ({ productId }: UseUpdateProductDataProps) => {
  const { trigger, isMutating, error, data, reset } = useSWRMutation(
    ['product', productId, 'update'],
    async (_key, { arg }: UpdateProductArgs) => {
      const result = await updateProduct(productId, arg);

      // Invalidate related caches after successful update
      await mutate(['product', productId]); // Refresh product detail
      await mutate((key) => Array.isArray(key) && key[0] === 'products'); // Refresh product list

      return result;
    },
    {
      throwOnError: false, // Don't throw, return error instead
      revalidate: true // Revalidate after mutation
    }
  );

  return {
    updateProduct: trigger,
    isUpdating: isMutating,
    error,
    data,
    reset
  };
};

export default useUpdateProductData;
