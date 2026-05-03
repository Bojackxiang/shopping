'use client';

import { getAllCustomers } from '@/repositories/customer/customer.repository';
import type { GetAllCustomersInputProps } from '@/repositories/customer/customer.types';
import useSWR from 'swr';

type UseUserListParams = Partial<GetAllCustomersInputProps>;

export const useUserList = (params?: UseUserListParams) => {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const orderBy = params?.orderBy ?? 'createdAt';

  const swrKey = ['users', page, pageSize, orderBy];

  const swrData = useSWR(
    swrKey,
    () => getAllCustomers({ page, pageSize, orderBy }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  );

  return {
    ...swrData,
    data: swrData.data?.data ?? [],
    pagination: swrData.data?.pagination ?? null,
    total: swrData.data?.pagination?.total ?? 0,
    totalPages: swrData.data?.pagination?.totalPages ?? 0,
    isLoading: swrData.isLoading,
    isValidating: swrData.isValidating
  };
};

export default useUserList;
