'use client';

import { Customer, getCustomerById } from '@/repositories';
import { delay } from '@/utils/delay';
import { useCallback, useEffect, useState } from 'react';

interface UseCustomerDetailProps {
  id: string;
  enabled?: boolean; // 添加 enabled 选项来控制是否自动获取
}

const useCustomerDetail = (props: UseCustomerDetailProps) => {
  const { id, enabled = false } = props; // 默认设置为 false，不自动获取

  const [data, setData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerDetail = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);

    await delay(500);

    try {
      const customerData = await getCustomerById(customerId);
      setData(customerData);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 只有当 enabled 为 true 且有 id 时才自动获取
    if (enabled && id) {
      fetchCustomerDetail(id);
    }
  }, [id, enabled, fetchCustomerDetail]);

  return {
    data,
    loading,
    error,
    refetch: fetchCustomerDetail
  };
};

export default useCustomerDetail;
