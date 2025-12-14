import { CartError } from "@/custom-error/CartError";
import { UserNotFoundError } from "@/custom-error/UserNotFound";
import { db } from "@/lib/prisma";

export interface CustomerAddingCartInput {
  customerClerkId: string;
  variantId: string;
  quantity?: number;
}
export class CartRepo {
  // 用户添加商品到购物车
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

  // 用户更新购物车商品数量
  static async customerUpdateCart({
    customerClerkId,
    variantId,
    quantity = 1,
  }: {
    customerClerkId: string;
    variantId: string;
    quantity?: number;
  }) {
    if (!customerClerkId) throw new Error("customerClerkId is required");
    if (!variantId) throw new Error("variantId is required");
    if (quantity < 0) throw new Error("quantity must be >= 0");

    return await db.$transaction(async (tx) => {
      const customer = await tx.customers.findUnique({
        where: { clerkId: customerClerkId },
      });
      if (!customer) {
        throw new UserNotFoundError("Customer With ClerkId Not Found");
      }

      const customerId = customer.id;

      let cart = await tx.carts.findUnique({
        where: { customerId },
      });
      if (!cart) {
        cart = await tx.carts.create({
          data: { customerId },
        });
      }

      const existing = await tx.cart_items.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId,
          },
        },
      });

      // ----------------------------
      // 处理 quantity = 0 的业务规则
      // ----------------------------
      if (quantity === 0) {
        throw new CartError("Quantity in cart cannot be zero");
      }

      // ----------------------------
      // quantity >= 1
      // ----------------------------
      if (existing) {
        if (existing.quantity !== quantity) {
          // update only when different
          await tx.cart_items.update({
            where: { id: existing.id },
            data: { quantity },
          });
        }
      }

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

  // host/cart 页面获取购物车及其商品详情
  static async fetchCartItemsByCustomerClerkId(customerClerkId: string) {
    if (!customerClerkId) throw new Error("customerClerkId is required");

    const customer = await db.customers.findUnique({
      where: { clerkId: customerClerkId },
    });

    if (!customer) {
      throw new Error(`Customer with clerkId ${customerClerkId} not found`);
    }
    const customerId = customer.id;

    const cart = await db.carts.findUnique({
      where: {
        customerId,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return null;
    }

    return cart;
  }

  // 用户获取商品详情页面中正确的 cart 数量
  static async getCartItemQuantityForVariant({
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

  // 用户更新购物车商品数量
  static async customerRemoveVariant({
    customerClerkId,
    variantId,
  }: {
    customerClerkId: string;
    variantId: string;
  }) {
    if (!customerClerkId) throw new Error("customerClerkId is required");
    if (!variantId) throw new Error("variantId is required");

    return await db.$transaction(async (tx) => {
      const customer = await tx.customers.findUnique({
        where: { clerkId: customerClerkId },
      });
      if (!customer) {
        throw new UserNotFoundError("Customer With ClerkId Not Found");
      }

      const customerId = customer.id;

      let cart = await tx.carts.findUnique({
        where: { customerId },
      });
      if (!cart) {
        cart = await tx.carts.create({
          data: { customerId },
        });
      }

      const existing = await tx.cart_items.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId,
          },
        },
      });

      if (existing) {
        await tx.cart_items.delete({
          where: { id: existing.id },
        });
      }

      return tx.cart_items.findMany({
        where: { cartId: cart.id },
        orderBy: { updatedAt: "desc" },
      });
    });
  }
}
