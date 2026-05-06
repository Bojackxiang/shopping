import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { assertCronAuth } from '@/lib/cron/auth';
import { emitCustomerEvent } from '@/lib/events/dispatcher';
import { CustomerEventType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Daily birthday cron.
 *
 * Scans `customers.birthday` for any row whose month+day matches today's UTC
 * date and emits a `BIRTHDAY` event for each. The dispatcher's idempotency
 * (dedupeKey = `bd:<customerId>:<YYYY-MM-DD>`) keeps re-runs within the same
 * UTC day from double-issuing.
 */
export async function GET(req: Request) {
  const unauthorized = assertCronAuth(req);
  if (unauthorized) return unauthorized;

  const now = new Date();
  const todayMonth = now.getUTCMonth() + 1; // 1-12
  const todayDay = now.getUTCDate(); // 1-31
  const yyyymmdd = formatYYYYMMDD(now);

  const customers = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM customers
    WHERE birthday IS NOT NULL
      AND EXTRACT(MONTH FROM birthday) = ${todayMonth}
      AND EXTRACT(DAY FROM birthday) = ${todayDay}
  `;

  let processed = 0;
  let granted = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of customers) {
    const result = await emitCustomerEvent({
      type: CustomerEventType.BIRTHDAY,
      customerId: c.id,
      payload: { yyyymmdd },
    });
    if (result.status === 'processed') {
      processed += 1;
      if (result.grantedCouponId) granted += 1;
    } else if (result.status === 'skipped') {
      skipped += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    yyyymmdd,
    candidates: customers.length,
    processed,
    granted,
    skipped,
    failed,
  });
}

function formatYYYYMMDD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
