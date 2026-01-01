'use server';

import { db } from '@/lib/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import {
  CreateOrderData,
  UpdateOrderData,
  UpdateOrderStatusData,
  UpdatePaymentStatusData,
  GetOrdersParams,
  GetOrdersResponse,
  SerializedOrder,
  SerializedOrderItem
} from './order.type';

// 辅助函数：序列化订单项
function serializeOrderItem(item: any): SerializedOrderItem {
  return {
    id: item.id,
    orderId: item.orderId,
    productName: item.productName,
    productSlug: item.productSlug,
    productImage: item.productImage,
    quantity: item.quantity,
    price: Number(item.price),
    total: Number(item.total),
    createdAt: item.createdAt.toISOString(),
    variantId: item.variantId,
    variantName: item.variantName
  };
}

// 辅助函数：序列化订单
function serializeOrder(order: any): SerializedOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    addressId: order.addressId,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    trackingNumber: order.trackingNumber,
    shippedAt: order.shippedAt?.toISOString() || null,
    deliveredAt: order.deliveredAt?.toISOString() || null,
    customerNote: order.customerNote,
    adminNote: order.adminNote,
    cancelledAt: order.cancelledAt?.toISOString() || null,
    cancelReason: order.cancelReason,
    refundedAt: order.refundedAt?.toISOString() || null,
    refundAmount: order.refundAmount ? Number(order.refundAmount) : null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customerId: order.customerId,
    couponId: order.couponId,
    order_items: order.order_items?.map(serializeOrderItem),
    customers: order.customers
      ? {
          id: order.customers.id,
          email: order.customers.email,
          firstName: order.customers.firstName,
          lastName: order.customers.lastName,
          username: order.customers.username,
          phone: order.customers.phone
        }
      : undefined,
    coupons: order.coupons
      ? {
          id: order.coupons.id,
          code: order.coupons.code,
          type: order.coupons.type,
          value: Number(order.coupons.value)
        }
      : null
  };
}

// 生成订单号
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = nanoid(6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * 创建订单
 */
export async function createOrder(data: CreateOrderData) {
  const orderNumber = generateOrderNumber();
  const orderId = nanoid();

  const order = await db.orders.create({
    data: {
      id: orderId,
      orderNumber,
      customerId: data.customerId,
      addressId: data.addressId,
      shippingFullName: data.shippingFullName,
      shippingPhone: data.shippingPhone,
      shippingAddressLine1: data.shippingAddressLine1,
      shippingAddressLine2: data.shippingAddressLine2,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost || 0,
      tax: data.tax || 0,
      discount: data.discount || 0,
      total: data.total,
      couponId: data.couponId,
      paymentMethod: data.paymentMethod,
      customerNote: data.customerNote,
      updatedAt: new Date(),
      order_items: {
        create: data.items.map((item) => ({
          id: nanoid(),
          productName: item.productName,
          productSlug: item.productSlug,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          variantId: item.variantId,
          variantName: item.variantName
        }))
      }
    },
    include: {
      order_items: true,
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true
        }
      },
      coupons: {
        select: {
          id: true,
          code: true,
          type: true,
          value: true
        }
      }
    }
  });

  return serializeOrder(order);
}

/**
 * 更新订单
 */
export async function updateOrder(data: UpdateOrderData) {
  const { id, ...updateData } = data;

  const order = await db.orders.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date()
    },
    include: {
      order_items: true,
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true
        }
      },
      coupons: {
        select: {
          id: true,
          code: true,
          type: true,
          value: true
        }
      }
    }
  });

  return serializeOrder(order);
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(data: UpdateOrderStatusData) {
  const { id, ...statusData } = data;

  const order = await db.orders.update({
    where: { id },
    data: {
      ...statusData,
      updatedAt: new Date()
    },
    include: {
      order_items: true,
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true
        }
      }
    }
  });

  return serializeOrder(order);
}

/**
 * 更新支付状态
 */
export async function updatePaymentStatus(data: UpdatePaymentStatusData) {
  const { id, paymentStatus, paymentMethod } = data;

  const order = await db.orders.update({
    where: { id },
    data: {
      paymentStatus,
      paymentMethod,
      updatedAt: new Date()
    },
    include: {
      order_items: true,
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true
        }
      }
    }
  });

  return serializeOrder(order);
}

/**
 * 获取订单列表（分页）
 */
export async function getOrders(
  params: GetOrdersParams = {}
): Promise<GetOrdersResponse> {
  const {
    page = 1,
    pageSize = 10,
    search,
    status,
    paymentStatus,
    customerId,
    startDate,
    endDate
  } = params;

  // 构建查询条件
  const where: any = {};

  // 搜索条件（订单号、客户邮箱、客户名称）
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { shippingFullName: { contains: search, mode: 'insensitive' } },
      { shippingPhone: { contains: search, mode: 'insensitive' } },
      {
        customers: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    ];
  }

  // 订单状态筛选
  if (status) {
    where.status = status;
  }

  // 支付状态筛选
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  // 客户筛选
  if (customerId) {
    where.customerId = customerId;
  }

  // 日期范围筛选
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  // 查询订单和总数
  const [orders, total] = await Promise.all([
    db.orders.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        order_items: true,
        customers: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true
          }
        },
        coupons: {
          select: {
            id: true,
            code: true,
            type: true,
            value: true
          }
        }
      }
    }),
    db.orders.count({ where })
  ]);

  return {
    items: orders.map(serializeOrder),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * 根据ID获取订单详情
 */
export async function getOrderById(id: string) {
  const order = await db.orders.findUnique({
    where: { id },
    include: {
      order_items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              name: true,
              color: true,
              size: true,
              material: true
            }
          }
        }
      },
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          imageUrl: true
        }
      },
      addresses: true,
      coupons: {
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          description: true
        }
      }
    }
  });

  if (!order) {
    return null;
  }

  return serializeOrder(order);
}

/**
 * 根据订单号获取订单
 */
export async function getOrderByNumber(orderNumber: string) {
  const order = await db.orders.findUnique({
    where: { orderNumber },
    include: {
      order_items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              name: true,
              color: true,
              size: true,
              material: true
            }
          }
        }
      },
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          imageUrl: true
        }
      },
      addresses: true,
      coupons: true
    }
  });

  if (!order) {
    return null;
  }

  return serializeOrder(order);
}

/**
 * 删除订单
 */
export async function deleteOrder(id: string) {
  await db.orders.delete({
    where: { id }
  });

  return { success: true };
}

/**
 * 获取客户的订单列表
 */
export async function getCustomerOrders(
  customerId: string,
  params: GetOrdersParams = {}
) {
  return getOrders({
    ...params,
    customerId
  });
}

/**
 * 获取订单统计
 */
export async function getOrderStats(params: {
  startDate?: Date;
  endDate?: Date;
}) {
  const { startDate, endDate } = params;

  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    refundedOrders,
    totalRevenue,
    pendingPayments,
    paidOrders
  ] = await Promise.all([
    db.orders.count({ where }),
    db.orders.count({ where: { ...where, status: OrderStatus.PENDING } }),
    db.orders.count({ where: { ...where, status: OrderStatus.PROCESSING } }),
    db.orders.count({ where: { ...where, status: OrderStatus.SHIPPED } }),
    db.orders.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
    db.orders.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
    db.orders.count({ where: { ...where, status: OrderStatus.REFUNDED } }),
    db.orders.aggregate({
      where: { ...where, paymentStatus: PaymentStatus.PAID },
      _sum: { total: true }
    }),
    db.orders.count({
      where: { ...where, paymentStatus: PaymentStatus.PENDING }
    }),
    db.orders.count({ where: { ...where, paymentStatus: PaymentStatus.PAID } })
  ]);

  return {
    totalOrders,
    ordersByStatus: {
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
      refunded: refundedOrders
    },
    paymentStats: {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      pendingPayments,
      paidOrders
    }
  };
}

/**
 * 获取最近的销售数据
 */
export async function getRecentSales(limit: number = 5) {
  const orders = await db.orders.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    where: {
      paymentStatus: PaymentStatus.PAID
    },
    include: {
      customers: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          username: true,
          imageUrl: true
        }
      }
    }
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    customer: order.customers
      ? {
          id: order.customers.id,
          email: order.customers.email,
          name:
            order.customers.firstName && order.customers.lastName
              ? `${order.customers.firstName} ${order.customers.lastName}`
              : order.customers.username || order.customers.email,
          imageUrl: order.customers.imageUrl
        }
      : null
  }));
}

/**
 * 获取月度收入和增长率
 */
export async function getMonthlyRevenue() {
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

  // 获取本月数据
  const currentMonthStats = await db.orders.aggregate({
    where: {
      createdAt: { gte: currentMonth },
      paymentStatus: PaymentStatus.PAID
    },
    _sum: { total: true }
  });

  // 获取上月数据
  const lastMonthStats = await db.orders.aggregate({
    where: {
      createdAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd
      },
      paymentStatus: PaymentStatus.PAID
    },
    _sum: { total: true }
  });

  const currentRevenue = Number(currentMonthStats._sum.total || 0);
  const lastRevenue = Number(lastMonthStats._sum.total || 0);

  // 计算增长率
  const growthRate =
    lastRevenue === 0
      ? 100
      : Number(
          (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1)
        );

  return {
    totalRevenue: currentRevenue,
    totalRevenueLastMonth: lastRevenue,
    totalRevenueGrowthRate: growthRate
  };
}

// ...existing code...

/**
 * 获取过去6个月的订单金额统计
 */
export async function getSixMonthsRevenueData() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // 获取过去6个月的每月数据
  const monthlyData = await db.orders.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: sixMonthsAgo },
      paymentStatus: PaymentStatus.PAID
    },
    _sum: { total: true },
    orderBy: { createdAt: 'asc' }
  });

  // 按月份聚合数据
  const aggregatedData: { [key: string]: number } = {};

  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthKey = date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric'
    });
    aggregatedData[monthKey] = 0;
  }

  // 计算每个月的收入
  monthlyData.forEach((item) => {
    const date = new Date(item.createdAt);
    const monthKey = date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric'
    });
    if (aggregatedData[monthKey] !== undefined) {
      aggregatedData[monthKey] += Number(item._sum.total || 0);
    }
  });

  // 转换为图表数据格式
  const chartData = Object.entries(aggregatedData).map(([month, revenue]) => ({
    month,
    revenue: Number(revenue.toFixed(2))
  }));

  return chartData;
}
