'use client';

import useSWR from 'swr';
import { getAllTags } from '@/repositories';
import { delay } from '@/utils/delay';

const useTagsData = () => {
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

  return {
    availableTags: swrData?.data || [],
    isLoading: swrData.isLoading,
    refetch: swrData.mutate
  };
};

export default useTagsData;
