import { db } from "@/lib/prisma";

export interface CustomerAddingCartInput {
  customerClerkId: string;
  variantId: string;
  quantity?: number;
}
export class CartRepo {
  static async customerAddingCart({
    customerClerkId,
    variantId,
    quantity = 1,
  }: {
    customerClerkId: string;
    variantId: string;
    quantity?: number;
  }) {
    if (!customerClerkId) throw new Error("customerClerk   Id is required");
    if (!variantId) throw new Error("variantId is required");
    if (quantity <= 0) throw new Error("quantity must be >= 1");

    return await db.$transaction(async (tx) => {
      const customer = await tx.customers.findUnique({
        where: { clerkId: customerClerkId },
      });

      if (!customer) {
        throw new Error(`Customer with clerkId ${customerClerkId} not found`);
      }
      const customerId = customer.id;
      let cart = await tx.carts.findUnique({
        where: { customerId },
      });

      if (!cart) {
        cart = await tx.carts.create({
          data: {
            customerId,
          },
        });
      }

      // 2) 查找是否已有 cart_item
      const existing = await tx.cart_items.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId,
          },
        },
      });

      // 3) 更新或创建 cart_item
      if (existing) {
        await tx.cart_items.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
          },
        });
      } else {
        await tx.cart_items.create({
          data: {
            cartId: cart.id,
            variantId,
            quantity,
            createdAt: new Date(),
          },
        });
      }

      // 返回最新购物车
      return tx.cart_items.findMany({
        where: { cartId: cart.id },
        orderBy: { updatedAt: "desc" },
      });
    });
  }

  static async touristAddingCart({
    localCart,
    variantId,
    quantity = 1,
  }: {
    localCart?: {
      items: Array<{
        variantId: string;
        quantity: number;
      }>;
    } | null;
    variantId: string;
    quantity?: number;
  }) {
    if (!variantId) throw new Error("variantId is required");
    if (quantity <= 0) throw new Error("quantity must be >= 1");

    // 如果本地没有 cart，则创建一个新的 cart 结构
    const cart = localCart ?? { items: [] };

    // 查找是否已有同 variant
    const existing = cart.items.find((i) => i.variantId === variantId);

    if (existing) {
      existing.quantity += quantity; // 累加
    } else {
      cart.items.push({
        variantId,
        quantity,
      });
    }

    return cart;
  }

  static async getCustomerCartItemsByVariant({
    customerClerkId,
    variantId,
  }: {
    customerClerkId: string;
    variantId: string;
  }) {
    if (!customerClerkId) throw new Error("customerClerkId is required");

    const customer = await db.customers.findUnique({
      where: { clerkId: customerClerkId },
    });

    if (!customer) {
      throw new Error(`Customer with clerkId ${customerClerkId} not found`);
    }
    const customerId = customer.id;

    const cart = await db.carts.findUnique({
      where: { customerId },
    });

    if (!cart) {
      return null;
    }

    return await db.cart_items.findFirst({
      where: { cartId: cart.id, variantId },
      orderBy: { updatedAt: "desc" },
    });
  }
  // static async mergeLocalCartToCustomerCart({
  //   customerId,
  //   localItems,
  // }: {
  //   customerId: string;
  //   localItems: Array<{ variantId: string; quantity: number }>;
  // }) {
  //   if (!localItems?.length) return;

  //   for (const item of localItems) {
  //     await this.customerAddingCart({
  //       customerId,
  //       variantId: item.variantId,
  //       quantity: item.quantity,
  //     });
  //   }
  // }
}
