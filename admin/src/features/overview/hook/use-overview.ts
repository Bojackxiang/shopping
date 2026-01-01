'use client';

import useSWR from 'swr';
import { getMonthlyRevenue } from '@/repositories/order/order.repo';
import { getMonthlyNewCustomers } from '@/repositories/customer/customer.repository';

const useOverView = () => {
  // 获取月度收入数据
  const { data: revenueData, isLoading: revenueLoading } = useSWR(
    'monthly-revenue',
    getMonthlyRevenue,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  // 获取月度新客户数据
  const { data: customersData, isLoading: customersLoading } = useSWR(
    'monthly-new-customers',
    getMonthlyNewCustomers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const isLoading = revenueLoading || customersLoading;

  return {
    // 收入相关
    totalRevenue: revenueData?.totalRevenue || 0,
    totalRevenueGrowthRate: revenueData?.totalRevenueGrowthRate || 0,
    totalRevenueLastMonth: revenueData?.totalRevenueLastMonth || 0,

    // 客户相关
    newCustomers: customersData?.newCustomers || 0,
    newCustomersGrowthRate: customersData?.newCustomersGrowthRate || 0,
    newCustomersLastMonth: customersData?.newCustomersLastMonth || 0,

    // 活跃账户（暂时使用固定值，后续可以添加实际逻辑）
    activeAccount: 4567,
    activeAccountGrowthRate: 5.4,

    // 加载状态
    isLoading
  };
};

export default useOverView;
