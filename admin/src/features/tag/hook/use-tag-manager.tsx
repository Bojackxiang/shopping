'use client';

import useSWR from 'swr';
import {
  createTag,
  getAllTags,
  updateTag,
  CreateTagInput,
  UpdateTagInput
} from '@/repositories';
import { delay } from '@/utils/delay';
import { handleError } from '@/utils';

export const useTagManager = () => {
  const swrData = useSWR(
    'tags',
    async () => {
      await delay(500);
      const result = await getAllTags({ pageSize: 1000 });
      return result.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  );

  const handleAddTag = async (data: CreateTagInput) => {
    try {
      await createTag(data);
      await swrData.mutate();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateTag = async (id: string, data: UpdateTagInput) => {
    try {
      await updateTag(id, data);
      await swrData.mutate();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSetTagActive = async (id: string, isActive: boolean) => {
    try {
      await updateTag(id, { isActive });
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
    handleAddTag,
    handleUpdateTag,
    handleSetTagActive
  };
};
