'use client';

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory
} from '@/repositories';
import { delay } from '@/utils/delay';
import useSWR from 'swr';
import {
  categoryCreateInputType,
  categoryType
} from '../schema/category-schema';
import { handleError } from '@/utils';

export const useCategoryManager = () => {
  const swrData = useSWR(
    'categories',
    async () => {
      await delay(2000);
      return await getAllCategories();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1 minute
    }
  );

  const handleAddCategory = async (data: categoryCreateInputType) => {
    try {
      await createCategory(data);
      await swrData.mutate();
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateCategory = async (
    id: string,
    updatedFields: Partial<categoryCreateInputType>
  ) => {
    try {
      await updateCategory(id, updatedFields);
      await swrData.mutate();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await swrData.mutate();
    } catch (error) {
      throw error;
    }
  };

  return {
    ...swrData,
    data: swrData?.data || [],
    isLoading: swrData.isLoading,
    isValidating: swrData.isValidating,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory
  };
};
