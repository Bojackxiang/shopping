import { OrderError } from "@/custom-error/OrderError";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const orderWithItems = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    order_items: true,
  },
});

type OrderWithItems = Prisma.ordersGetPayload<typeof orderWithItems>;

// Serializable type for client consumption (Decimal → number)
export type SerializableOrderWithItems = Omit<
  OrderWithItems,
  | "subtotal"
  | "shippingCost"
  | "tax"
  | "discount"
  | "total"
  | "refundAmount"
  | "order_items"
> & {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  refundAmount: number | null;
  order_items: Array<
    Omit<OrderWithItems["order_items"][number], "price" | "total"> & {
      price: number;
      total: number;
    }
  >;
};

/**
 * Convert Prisma Decimal fields to plain numbers for client serialization
 */
const serializeOrder = (order: OrderWithItems): SerializableOrderWithItems => {
  return {
    ...order,
    subtotal: order.subtotal.toNumber(),
    shippingCost: order.shippingCost.toNumber(),
    tax: order.tax.toNumber(),
    discount: order.discount.toNumber(),
    total: order.total.toNumber(),
    refundAmount: order.refundAmount?.toNumber() ?? null,
    order_items: order.order_items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      total: item.total.toNumber(),
    })),
  };
};

export type PaginatedOrderResponse = {
  orders: SerializableOrderWithItems[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export class OrderRepo {
  /**
   * 通过 clerk id 获取用户的订单列表
   * @param userId - Clerk user ID
   */
  static async fetchRecentOrderByUserId(
    userId: string
  ): Promise<SerializableOrderWithItems[]> {
    if (!userId) {
      throw new OrderError("User is not authenticated");
    }

    const customer = await db.customers.findUnique({
      where: { clerkId: userId },
    });

    if (!customer) {
      throw new OrderError(`Customer with clerkId ${userId} not found`);
    }

    const orders = await db.orders.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: {
        order_items: true,
      },
    });

    // Convert Decimal to number for client serialization
    return orders.map(serializeOrder);
  }

  static async fetchUserOrderByPage(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedOrderResponse> {
    if (!userId) {
      throw new OrderError("User is not authenticated");
    }

    // Validate pagination parameters
    if (page < 1) {
      throw new OrderError("Page number must be greater than 0");
    }
    if (limit < 1 || limit > 100) {
      throw new OrderError("Limit must be between 1 and 100");
    }

    const customer = await db.customers.findUnique({
      where: { clerkId: userId },
    });

    if (!customer) {
      throw new OrderError(`Customer with clerkId ${userId} not found`);
    }

    const [orders, totalOrders] = await Promise.all([
      db.orders.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        include: {
          order_items: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.orders.count({
        where: { customerId: customer.id },
      }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return {
      orders: orders.map(serializeOrder),
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
