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
