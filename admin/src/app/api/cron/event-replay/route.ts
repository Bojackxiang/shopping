import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { assertCronAuth } from '@/lib/cron/auth';
import { emitCustomerEvent } from '@/lib/events/dispatcher';
import { CustomerEventType, EventProcessStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const PENDING_STALE_MINUTES = 30;
const REPLAY_BATCH = 50;

/**
 * Hourly replay cron.
 *
 * Picks up event rows that previously FAILED or that have been stuck PENDING
 * for too long (e.g. process crashed mid-flight) and re-runs them through the
 * dispatcher. Re-emits hit the existing row by the unique
 * `(type, dedupeKey)` constraint, so no duplicate rows are created.
 */
export async function GET(req: Request) {
  const unauthorized = assertCronAuth(req);
  if (unauthorized) return unauthorized;

  const stalePendingCutoff = new Date(
    Date.now() - PENDING_STALE_MINUTES * 60_000
  );

  const stuck = await db.customer_events.findMany({
    where: {
      OR: [
        { status: EventProcessStatus.FAILED },
        {
          status: EventProcessStatus.PENDING,
          occurredAt: { lt: stalePendingCutoff },
        },
      ],
    },
    orderBy: { occurredAt: 'asc' },
    take: REPLAY_BATCH,
  });

  let processed = 0;
  let granted = 0;
  let stillFailed = 0;

  for (const ev of stuck) {
    const payload =
      ev.payload && typeof ev.payload === 'object' && !Array.isArray(ev.payload)
        ? (ev.payload as Record<string, unknown>)
        : {};
    const result = await emitCustomerEvent({
      type: ev.type as CustomerEventType,
      customerId: ev.customerId,
      payload: payload as never,
      dedupeKey: ev.dedupeKey,
    });
    if (result.status === 'processed') {
      processed += 1;
      if (result.grantedCouponId) granted += 1;
    } else {
      stillFailed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: stuck.length,
    processed,
    granted,
    stillFailed,
    stalePendingCutoff: stalePendingCutoff.toISOString(),
  });
}
