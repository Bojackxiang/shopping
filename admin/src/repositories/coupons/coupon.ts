'use server';

import { db } from '@/lib/prisma';
import { CouponType } from '@prisma/client';

/**
 * 查询参数类型（给 Coupon List Page 用）
 */
export type CouponListParams = {
  page?: number;
  pageSize?: number;
  totalPages?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Coupon List（分页 + 搜索 + 排序）
 */
export async function getCoupons(params: CouponListParams) {
  const {
    page = 1,
    pageSize = 10,
    search,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  const where: any = {
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(search && {
      code: {
        contains: search,
        mode: 'insensitive'
      }
    })
  };

  const [items, total] = await Promise.all([
    db.coupons.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        code: true,
        description: true,
        type: true,
        value: true,
        usageCount: true,
        usageLimit: true,
        startDate: true,
        endDate: true,
        isActive: true,
        createdAt: true
      }
    }),
    db.coupons.count({ where })
  ]);

  const transferredItems = items.map((item) => ({
    ...item,
    value: Number(item.value),
    startDate: item.startDate.toISOString(),
    endDate: item.endDate.toISOString(),
    createdAt: item.createdAt.toISOString()
  }));

  return {
    items: transferredItems,
    total,
    page,
    pageSize
  };
}

/**
 * 获取单个 Coupon（详情页 / 编辑页）
 */
export async function getCouponById(id: string) {
  const coupon = await db.coupons.findUnique({
    where: { id }
  });

  if (!coupon) return null;

  return {
    ...coupon,
    value: Number(coupon.value),
    minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    startDate: coupon.startDate.toISOString(),
    endDate: coupon.endDate.toISOString(),
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString()
  };
}

/**
 * 创建 Coupon
 */
export async function createCoupon(data: {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}) {
  const coupon = await db.coupons.create({
    data: {
      code: data.code,
      description: data.description,
      type: data.type,
      value: data.value,
      minPurchase: data.minPurchase,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      usageLimitPerCustomer: data.usageLimitPerCustomer,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true
    }
  });

  // 序列化 Decimal 和 Date 类型以便传递给 Client Component
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: Number(coupon.value),
    minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    usageLimit: coupon.usageLimit,
    usageLimitPerCustomer: coupon.usageLimitPerCustomer,
    usageCount: coupon.usageCount,
    startDate: coupon.startDate.toISOString(),
    endDate: coupon.endDate.toISOString(),
    isActive: coupon.isActive,
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString()
  };
}

/**
 * 更新 Coupon
 */
export async function updateCoupon(
  id: string,
  data: Partial<{
    description: string;
    type: CouponType;
    value: number;
    minPurchase: number;
    maxDiscount: number;
    usageLimit: number;
    usageLimitPerCustomer: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  }>
) {
  const coupon = await db.coupons.update({
    where: { id },
    data
  });

  // 序列化 Decimal 和 Date 类型
  return {
    ...coupon,
    value: Number(coupon.value),
    minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    startDate: coupon.startDate.toISOString(),
    endDate: coupon.endDate.toISOString(),
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString()
  };
}

/**
 * 启用 / 停用 Coupon（List Page 常用）
 */
export async function toggleCouponStatus(id: string, isActive: boolean) {
  const coupon = await db.coupons.update({
    where: { id },
    data: { isActive }
  });

  // 序列化 Decimal 和 Date 类型
  return {
    ...coupon,
    value: Number(coupon.value),
    minPurchase: coupon.minPurchase ? Number(coupon.minPurchase) : null,
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    startDate: coupon.startDate.toISOString(),
    endDate: coupon.endDate.toISOString(),
    createdAt: coupon.createdAt.toISOString(),
    updatedAt: coupon.updatedAt.toISOString()
  };
}

/**
 * 判断 Coupon 是否已过期（工具方法）
 */
export async function isCouponExpired(id: string) {
  const coupon = await db.coupons.findUnique({
    where: { id },
    select: { endDate: true }
  });

  if (!coupon) return true;

  return coupon.endDate < new Date();
}

/**
 * delete coupon by id (
 */
export async function deleteCoupon(id: string) {
  try {
    await db.coupons.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error('Failed to delete coupon');
  }
}
