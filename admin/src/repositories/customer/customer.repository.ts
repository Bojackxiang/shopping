'use server';

import { db } from '@/lib/prisma';

import {
  GetAllCustomersInputProps,
  PaginatedCustomersOutput
} from './customer.types';
import { handleError } from '@/utils';

/**
 * Search all customer with pagination
 * @param page 页码，默认为 1
 * @param pageSize 每页数量，默认为 10
 * @param orderBy 排序字段，默认按创建时间降序
 */
export const getAllCustomers = async ({
  page = 1,
  pageSize = 10,
  orderBy = 'createdAt'
}: GetAllCustomersInputProps): Promise<PaginatedCustomersOutput> => {
  try {
    const skip = (page - 1) * pageSize;

    const [customers, total] = await Promise.all([
      db.customers.findMany({
        skip,
        take: pageSize,
        orderBy: { [orderBy]: 'desc' }
      }),
      db.customers.count()
    ]);

    return {
      data: customers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Get customer by ID
 * @param id 客户 ID
 * @returns Customer 或 null
 */
export const getCustomerById = async (id: string) => {
  try {
    const customer = await db.customers.findUnique({
      where: { id }
    });

    return customer;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * 获取月度新客户和增长率
 */
export const getMonthlyNewCustomers = async () => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    // 获取本月新客户数
    const currentMonthCount = await db.customers.count({
      where: {
        createdAt: { gte: currentMonth }
      }
    });

    // 获取上月新客户数
    const lastMonthCount = await db.customers.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    });

    // 计算增长率
    const growthRate =
      lastMonthCount === 0
        ? 100
        : Number(
            (
              ((currentMonthCount - lastMonthCount) / lastMonthCount) *
              100
            ).toFixed(1)
          );

    return {
      newCustomers: currentMonthCount,
      newCustomersLastMonth: lastMonthCount,
      newCustomersGrowthRate: growthRate
    };
  } catch (error) {
    throw handleError(error);
  }
};
