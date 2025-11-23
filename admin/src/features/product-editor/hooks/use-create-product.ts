'use client';

import { createProduct } from '@/repositories';
import useSWRMutation from 'swr/mutation';

const useCreateProduct = () => {
  const { trigger, isMutating, error } = useSWRMutation(
    ['product', 'create'],
    async () => {
      const newProduct = await createProduct({
        name: 'new product',
        slug: crypto.randomUUID()
      });

      return {
        id: newProduct.id
      };
    },
    {
      revalidate: true // Revalidate after mutation
    }
  );

  return {
    trigger,
    isMutating,
    error
  };
};

export default useCreateProduct;
