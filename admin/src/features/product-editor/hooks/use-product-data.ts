'use client';

import useSWR from 'swr';
import { getProductByIdForAdmin } from '@/repositories/product/product.repository';

/**
 * 后台产品编辑器专用 Hook
 * 获取产品的完整数据，包括所有 variants（包括 isActive: false 的已停售规格）
 */
export function useProductData(productId: string) {
  return useSWR(
    productId && productId.trim() !== '' ? ['product', productId] : null,
    () => getProductByIdForAdmin(productId), // 使用后台专用函数
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  );
}
