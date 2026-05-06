import { db } from "@/lib/prisma";
import {
  CustomerEventType,
  Prisma,
  coupons,
  customers,
} from "@prisma/client";

type Payload = Record<string, unknown>;

type FindArgs = {
  eventType: CustomerEventType;
  payload: Payload;
  customer: customers;
};

export async function findMatchingCoupons({
  eventType,
  payload,
  customer,
}: FindArgs): Promise<coupons[]> {
  const now = new Date();

  const candidates = await db.coupons.findMany({
    where: {
      triggerEvent: eventType,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (candidates.length === 0) return [];

  const matched: coupons[] = [];
  for (const coupon of candidates) {
    if (
      !(await evaluateCondition(
        coupon.triggerCondition,
        eventType,
        payload,
        customer
      ))
    )
      continue;
    if (!(await evaluateAudience(coupon.audienceFilter, customer))) continue;

    const alreadyGranted = await db.customer_events.count({
      where: { customerId: customer.id, grantedCouponId: coupon.id },
    });
    if (alreadyGranted > 0) continue;

    matched.push(coupon);
  }
  return matched;
}

function num(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof value === "object" && value !== null && "toString" in value) {
    const n = Number((value as { toString: () => string }).toString());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asObject(
  json: Prisma.JsonValue | null
): Record<string, unknown> | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  return json as Record<string, unknown>;
}

export async function evaluateCondition(
  condition: Prisma.JsonValue | null,
  eventType: CustomerEventType,
  payload: Payload,
  customer: customers
): Promise<boolean> {
  const cond = asObject(condition);
  if (!cond) return true;

  let cachedOrderCount: number | null = null;
  const ordersCount = async () => {
    if (cachedOrderCount === null) {
      cachedOrderCount = await db.orders.count({
        where: { customerId: customer.id, paymentStatus: "PAID" },
      });
    }
    return cachedOrderCount;
  };

  let cachedTotalSpent: number | null = null;
  const totalSpent = async () => {
    if (cachedTotalSpent === null) {
      const agg = await db.orders.aggregate({
        where: { customerId: customer.id, paymentStatus: "PAID" },
        _sum: { total: true },
      });
      cachedTotalSpent = num(agg._sum.total) ?? 0;
    }
    return cachedTotalSpent;
  };

  for (const [key, raw] of Object.entries(cond)) {
    switch (key) {
      case "orderCountEq": {
        const target = num(raw);
        if (target === null) continue;
        if ((await ordersCount()) !== target) return false;
        break;
      }
      case "orderCountGte": {
        const target = num(raw);
        if (target === null) continue;
        if ((await ordersCount()) < target) return false;
        break;
      }
      case "orderAmountGte": {
        const target = num(raw);
        const amount = num(payload.amount);
        if (target === null) continue;
        if (amount === null || amount < target) return false;
        break;
      }
      case "totalSpentGte": {
        const target = num(raw);
        if (target === null) continue;
        if ((await totalSpent()) < target) return false;
        break;
      }
      case "reviewMinRating": {
        const target = num(raw);
        const rating = num(payload.rating);
        if (target === null) continue;
        if (rating === null || rating < target) return false;
        break;
      }
      case "approvedOnly": {
        if (raw === true && eventType === "REVIEW_SUBMITTED") return false;
        break;
      }
      case "favoriteCountGte": {
        const target = num(raw);
        if (target === null) continue;
        const cnt = await db.favorites.count({
          where: { customerId: customer.id },
        });
        if (cnt < target) return false;
        break;
      }
      case "thresholdEq": {
        const target = num(raw);
        const t = num(payload.threshold);
        if (target === null) continue;
        if (t === null || t !== target) return false;
        break;
      }
      default:
        break;
    }
  }
  return true;
}

export async function evaluateAudience(
  filter: Prisma.JsonValue | null,
  customer: customers
): Promise<boolean> {
  const f = asObject(filter);
  if (!f) return true;

  for (const [key, raw] of Object.entries(f)) {
    switch (key) {
      case "newCustomerOnly": {
        if (raw === true) {
          const cnt = await db.orders.count({
            where: { customerId: customer.id, paymentStatus: "PAID" },
          });
          if (cnt > 0) return false;
        }
        break;
      }
      case "existingTotalSpentGte": {
        const target = num(raw);
        if (target === null) continue;
        const agg = await db.orders.aggregate({
          where: { customerId: customer.id, paymentStatus: "PAID" },
          _sum: { total: true },
        });
        const spent = num(agg._sum.total) ?? 0;
        if (spent < target) return false;
        break;
      }
      case "ageGte": {
        const target = num(raw);
        if (target === null) continue;
        if (!customer.birthday) return false;
        const age = computeAge(customer.birthday);
        if (age < target) return false;
        break;
      }
      default:
        break;
    }
  }
  return true;
}

function computeAge(birthday: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - birthday.getUTCFullYear();
  const m = now.getUTCMonth() - birthday.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birthday.getUTCDate())) age--;
  return age;
}
