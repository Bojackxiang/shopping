import { Prisma, PrismaClient, CustomerEventType } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { emitCustomerEvent } from "@/lib/events/dispatcher";

type WriteOp = "create" | "update" | "delete";

/**
 * Map a Prisma model + write operation to a CustomerEventType.
 * Models / operations not in the map fall through silently.
 */
const MODEL_OP_MAP: Partial<
  Record<Prisma.ModelName, Partial<Record<WriteOp, CustomerEventType>>>
> = {
  favorites: {
    create: CustomerEventType.FAVORITE_ADDED,
    delete: CustomerEventType.FAVORITE_REMOVED,
  },
  cart_items: {
    create: CustomerEventType.CART_ITEM_ADDED,
    update: CustomerEventType.CART_ITEM_QUANTITY_CHANGED,
    delete: CustomerEventType.CART_ITEM_REMOVED,
  },
  addresses: {
    create: CustomerEventType.ADDRESS_SAVED,
    update: CustomerEventType.ADDRESS_SAVED,
    delete: CustomerEventType.ADDRESS_REMOVED,
  },
  reviews: {
    create: CustomerEventType.REVIEW_SUBMITTED,
  },
  orders: {
    create: CustomerEventType.ORDER_CREATED,
  },
  customers: {
    create: CustomerEventType.USER_SIGNUP,
  },
};

/**
 * Wrap a PrismaClient with an extension that auto-emits CustomerEvents on
 * every write operation listed in `MODEL_OP_MAP`.
 *
 * The base client is also returned for cases (e.g. lookup of a deleted
 * row's customerId) where the extension needs to query without re-entering
 * the audit pipeline.
 *
 * Failure to emit never blocks the underlying write — the caller's intent
 * always succeeds first.
 */
export function withAuditEvents(
  base: PrismaClient,
): ReturnType<typeof base.$extends> {
  return base.$extends({
    name: "audit-events",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const writeOp = operation as WriteOp;
          const eventType = MODEL_OP_MAP[model as Prisma.ModelName]?.[writeOp];

          if (!eventType) {
            return query(args);
          }

          const looseArgs = args as LooseArgs;

          // For delete: the row is about to disappear — pre-fetch any
          // info we need before the operation removes it.
          let preFetched: { customerId?: string } | null = null;
          if (writeOp === "delete") {
            preFetched = await prefetchForDelete(
              model as Prisma.ModelName,
              looseArgs,
              base,
            );
          }

          const result = await query(args);

          // Don't await — emit in background; never break callers.
          void runEmit({
            eventType,
            model: model as Prisma.ModelName,
            operation: writeOp,
            args: looseArgs,
            result,
            preFetched,
            base,
          });

          return result;
        },
      },
    },
  });
}

type LooseArgs = { data?: unknown; where?: unknown };

type EmitContext = {
  eventType: CustomerEventType;
  model: Prisma.ModelName;
  operation: WriteOp;
  args: LooseArgs;
  result: unknown;
  preFetched: { customerId?: string } | null;
  base: PrismaClient;
};

async function runEmit(ctx: EmitContext) {
  try {
    const customerId = await resolveCustomerId(ctx);
    if (!customerId) return;

    const payload = buildPayload(ctx);
    await emitCustomerEvent({
      type: ctx.eventType,
      customerId,
      payload: payload as never,
    });
  } catch (err) {
    console.error("[audit-events] failed to emit", {
      eventType: ctx.eventType,
      model: ctx.model,
      err,
    });
  }
}

async function resolveCustomerId(ctx: EmitContext): Promise<string | null> {
  // 1. Pre-fetched (delete branch) takes precedence.
  if (ctx.preFetched?.customerId) return ctx.preFetched.customerId;

  // 2. Result for customers.create — id IS the customerId.
  if (ctx.model === "customers" && ctx.operation === "create") {
    const id = (ctx.result as { id?: string })?.id;
    return id ?? null;
  }

  // 3. cart_items special: derive via cart.
  if (ctx.model === "cart_items") {
    const cartId = pluckCartId(ctx);
    if (cartId) {
      const cart = await ctx.base.carts.findUnique({
        where: { id: cartId },
        select: { customerId: true },
      });
      if (cart?.customerId) return cart.customerId;
    }
  }

  // 4. data.customerId on the args (favorites/addresses/reviews/orders).
  const dataCustomerId = (ctx.args.data as { customerId?: string })
    ?.customerId;
  if (dataCustomerId) return dataCustomerId;

  // 5. Fall back to currentUser → clerk → customer lookup.
  return await currentUserCustomerId(ctx.base);
}

function pluckCartId(ctx: EmitContext): string | undefined {
  if (ctx.args.data) {
    const cartId = (ctx.args.data as { cartId?: string }).cartId;
    if (cartId) return cartId;
  }
  if (ctx.result) {
    const cartId = (ctx.result as { cartId?: string }).cartId;
    if (cartId) return cartId;
  }
  return undefined;
}

async function currentUserCustomerId(
  base: PrismaClient,
): Promise<string | null> {
  try {
    const user = await currentUser();
    if (!user) return null;
    const customer = await base.customers.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });
    return customer?.id ?? null;
  } catch {
    return null;
  }
}

async function prefetchForDelete(
  model: Prisma.ModelName,
  args: LooseArgs,
  base: PrismaClient,
): Promise<{ customerId?: string } | null> {
  const where = args.where as { id?: string } | undefined;
  const id = where?.id;
  if (!id) return null;

  if (model === "cart_items") {
    const item = await base.cart_items.findUnique({
      where: { id },
      select: { carts: { select: { customerId: true } } },
    });
    return { customerId: item?.carts?.customerId };
  }
  if (model === "favorites") {
    const fav = await base.favorites.findUnique({
      where: { id },
      select: { customerId: true },
    });
    return { customerId: fav?.customerId };
  }
  if (model === "addresses") {
    const addr = await base.addresses.findUnique({
      where: { id },
      select: { customerId: true },
    });
    return { customerId: addr?.customerId };
  }
  return null;
}

function buildPayload(ctx: EmitContext): Record<string, unknown> {
  const { model, operation, args, result } = ctx;

  if (model === "favorites") {
    const data = (args.data ?? {}) as Record<string, unknown>;
    const r = (result ?? {}) as Record<string, unknown>;
    return {
      favoriteId: r.id ?? (args.where as { id?: string })?.id,
      productId: data.productId ?? r.productId,
    };
  }
  if (model === "cart_items") {
    const data = (args.data ?? {}) as Record<string, unknown>;
    const r = (result ?? {}) as Record<string, unknown>;
    return {
      variantId: data.variantId ?? r.variantId,
      quantity: data.quantity ?? r.quantity,
    };
  }
  if (model === "addresses") {
    const r = (result ?? {}) as Record<string, unknown>;
    const id = r.id ?? (args.where as { id?: string })?.id;
    return { addressId: id };
  }
  if (model === "reviews") {
    const data = (args.data ?? {}) as Record<string, unknown>;
    const r = (result ?? {}) as Record<string, unknown>;
    return {
      reviewId: r.id,
      productId: data.productId,
      rating: data.rating,
    };
  }
  if (model === "orders") {
    const r = (result ?? {}) as Record<string, unknown>;
    const total = r.total;
    return {
      orderId: r.id,
      amount: total ? Number((total as { toString: () => string }).toString()) : 0,
    };
  }
  if (model === "customers" && operation === "create") {
    const r = (result ?? {}) as Record<string, unknown>;
    return { clerkId: r.clerkId, email: r.email };
  }
  return {};
}
