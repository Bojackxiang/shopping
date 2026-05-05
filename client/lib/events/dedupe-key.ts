import { CustomerEventType } from "@prisma/client";
import { randomUUID } from "crypto";

/**
 * Build a unique dedupeKey for a customer event.
 *
 * Strategy:
 * - For events that should NOT repeat (signup, birthday, login per day,
 *   per-orderId), the key encodes the natural identity → DB unique
 *   constraint blocks duplicates.
 * - For everything else (cart toggles, favorite add/remove, address
 *   edits), the log layer just records — judgment is left to consuming
 *   rules — so the key includes a random UUID to guarantee uniqueness.
 */
export function buildDedupeKey(
  type: CustomerEventType,
  customerId: string,
  payload: Record<string, unknown>
): string {
  switch (type) {
    case "USER_SIGNUP":
      return `signup:${customerId}`;
    case "USER_LOGIN":
      return `login:${customerId}:${todayUtc()}`;
    case "BIRTHDAY":
      return `bd:${customerId}:${String(payload.yyyymmdd)}`;
    case "ORDER_CREATED":
      return `order_created:${String(payload.orderId)}`;
    case "ORDER_PAID":
      return `order_paid:${String(payload.orderId)}`;
    case "ORDER_DELIVERED":
      return `order_delivered:${String(payload.orderId)}`;
    case "ORDER_CANCELLED":
      return `order_cancelled:${String(payload.orderId)}`;
    case "REVIEW_SUBMITTED":
      return `review_sub:${String(payload.reviewId)}`;
    case "REVIEW_APPROVED":
      return `review_app:${String(payload.reviewId)}`;
    case "MILESTONE_TOTAL_SPENT":
      return `mts:${customerId}:${String(payload.threshold)}`;
    case "MILESTONE_ORDER_COUNT":
      return `moc:${customerId}:${String(payload.threshold)}`;

    case "FAVORITE_ADDED":
      return `fav_add:${customerId}:${String(payload.productId)}:${randomUUID()}`;
    case "FAVORITE_REMOVED":
      return `fav_rm:${customerId}:${String(payload.productId ?? payload.favoriteId)}:${randomUUID()}`;
    case "CART_ITEM_ADDED":
      return `cart_add:${customerId}:${String(payload.variantId)}:${randomUUID()}`;
    case "CART_ITEM_QUANTITY_CHANGED":
      return `cart_qty:${customerId}:${String(payload.variantId)}:${randomUUID()}`;
    case "CART_ITEM_REMOVED":
      return `cart_rm:${customerId}:${String(payload.variantId)}:${randomUUID()}`;
    case "ADDRESS_SAVED":
      return `addr_save:${customerId}:${randomUUID()}`;
    case "ADDRESS_REMOVED":
      return `addr_rm:${customerId}:${String(payload.addressId)}:${randomUUID()}`;

    case "PAGE_VIEWED":
      return `pageview:${customerId}:${String(payload.path)}:${randomUUID()}`;
    case "SORT_CHANGED":
      return `sort:${customerId}:${randomUUID()}`;
    case "FILTER_CHANGED":
      return `filter:${customerId}:${randomUUID()}`;
    case "SEARCH_PERFORMED":
      return `search:${customerId}:${randomUUID()}`;
    case "CART_MODAL_OPENED":
      return `cart_modal:${customerId}:${randomUUID()}`;

    default:
      return `${type}:${customerId}:${randomUUID()}`;
  }
}

function todayUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
