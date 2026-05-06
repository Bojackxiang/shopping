"use server";

import { db } from "@/lib/prisma";
import { CustomerEventType, EventProcessStatus } from "@prisma/client";
import { buildDedupeKey } from "./dedupe-key";
import { findMatchingCoupons } from "./rule-engine";
import type { EmitInput, EmitResult } from "./types";

const DEFAULT_VALIDITY_DAYS = 30;

export async function emitCustomerEvent<T extends CustomerEventType>(
  input: EmitInput<T>
): Promise<EmitResult> {
  const dedupeKey =
    input.dedupeKey ??
    buildDedupeKey(
      input.type,
      input.customerId,
      input.payload as Record<string, unknown>
    );

  let eventId: string | null = null;

  try {
    const ev = await db.customer_events.upsert({
      where: { type_dedupeKey: { type: input.type, dedupeKey } },
      create: {
        customerId: input.customerId,
        type: input.type,
        dedupeKey,
        payload: input.payload as object,
        status: EventProcessStatus.PENDING,
      },
      update: {},
    });
    eventId = ev.id;

    if (ev.status === EventProcessStatus.PROCESSED) {
      return {
        eventId,
        status: "skipped",
        grantedCouponId: ev.grantedCouponId,
        reason: "duplicate-processed",
      };
    }

    const customer = await db.customers.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) {
      await db.customer_events.update({
        where: { id: ev.id },
        data: {
          status: EventProcessStatus.FAILED,
          errorMessage: "customer not found",
          processedAt: new Date(),
        },
      });
      return {
        eventId,
        status: "failed",
        grantedCouponId: null,
        reason: "customer-not-found",
      };
    }

    const matched = await findMatchingCoupons({
      eventType: input.type,
      payload: input.payload as Record<string, unknown>,
      customer,
    });

    let grantedCouponId: string | null = null;
    let grantedExpiresAt: Date | null = null;

    if (matched.length > 0) {
      const coupon = matched[0];
      const validityDays = computeValidityDays(coupon.endDate);
      grantedExpiresAt = new Date(Date.now() + validityDays * 86_400_000);
      grantedCouponId = coupon.id;
    }

    await db.customer_events.update({
      where: { id: ev.id },
      data: {
        status: EventProcessStatus.PROCESSED,
        grantedCouponId,
        grantedExpiresAt,
        processedAt: new Date(),
      },
    });

    return {
      eventId,
      status: "processed",
      grantedCouponId,
    };
  } catch (err) {
    console.error("[emitCustomerEvent] failed", {
      type: input.type,
      customerId: input.customerId,
      err,
    });
    if (eventId) {
      await db.customer_events
        .update({
          where: { id: eventId },
          data: {
            status: EventProcessStatus.FAILED,
            errorMessage: (err as Error).message?.slice(0, 500),
            processedAt: new Date(),
          },
        })
        .catch(() => {});
    }
    return {
      eventId,
      status: "failed",
      grantedCouponId: null,
      reason: "exception",
    };
  }
}

function computeValidityDays(couponEndDate: Date): number {
  const days = Math.floor(
    (couponEndDate.getTime() - Date.now()) / 86_400_000
  );
  if (days <= 0) return DEFAULT_VALIDITY_DAYS;
  return Math.min(days, DEFAULT_VALIDITY_DAYS);
}
