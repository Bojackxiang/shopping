'use server';

import { db } from '@/lib/prisma';
import { CustomerEventType, EventProcessStatus } from '@prisma/client';

export type GetCustomerEventsParams = {
  page?: number;
  pageSize?: number;
  type?: CustomerEventType;
  status?: EventProcessStatus;
  customerId?: string;
  /**
   * Free-text search. Matches customer email/firstName/lastName, dedupeKey,
   * granted coupon code, customerId, and event id (case-insensitive contains).
   */
  search?: string;
};

export type CustomerEventRow = {
  id: string;
  type: CustomerEventType;
  status: EventProcessStatus;
  dedupeKey: string;
  payload: unknown;
  customerId: string;
  customerEmail: string | null;
  customerName: string | null;
  grantedCouponId: string | null;
  grantedCouponCode: string | null;
  grantedExpiresAt: string | null;
  occurredAt: string;
  processedAt: string | null;
  errorMessage: string | null;
};

export async function getCustomerEvents(params: GetCustomerEventsParams = {}) {
  const {
    page = 1,
    pageSize = 25,
    type,
    status,
    customerId,
    search
  } = params;

  const trimmed = search?.trim();
  const searchClause = trimmed
    ? {
        OR: [
          { id: { contains: trimmed, mode: 'insensitive' as const } },
          { customerId: { contains: trimmed, mode: 'insensitive' as const } },
          { dedupeKey: { contains: trimmed, mode: 'insensitive' as const } },
          {
            customers: {
              email: { contains: trimmed, mode: 'insensitive' as const }
            }
          },
          {
            customers: {
              firstName: { contains: trimmed, mode: 'insensitive' as const }
            }
          },
          {
            customers: {
              lastName: { contains: trimmed, mode: 'insensitive' as const }
            }
          },
          {
            coupons: {
              code: { contains: trimmed, mode: 'insensitive' as const }
            }
          }
        ]
      }
    : undefined;

  const where = {
    ...(type && { type }),
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...(searchClause ?? {})
  };

  const [items, total, statusCounts, grantedTotal] = await Promise.all([
    db.customer_events.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customers: { select: { email: true, firstName: true, lastName: true } },
        coupons: { select: { code: true } }
      }
    }),
    db.customer_events.count({ where }),
    db.customer_events.groupBy({
      by: ['status'],
      _count: { _all: true }
    }),
    db.customer_events.count({ where: { grantedCouponId: { not: null } } })
  ]);

  const rows: CustomerEventRow[] = items.map((ev) => ({
    id: ev.id,
    type: ev.type,
    status: ev.status,
    dedupeKey: ev.dedupeKey,
    payload: ev.payload,
    customerId: ev.customerId,
    customerEmail: ev.customers?.email ?? null,
    customerName:
      [ev.customers?.firstName, ev.customers?.lastName]
        .filter(Boolean)
        .join(' ') || null,
    grantedCouponId: ev.grantedCouponId,
    grantedCouponCode: ev.coupons?.code ?? null,
    grantedExpiresAt: ev.grantedExpiresAt
      ? ev.grantedExpiresAt.toISOString()
      : null,
    occurredAt: ev.occurredAt.toISOString(),
    processedAt: ev.processedAt ? ev.processedAt.toISOString() : null,
    errorMessage: ev.errorMessage
  }));

  const stats = {
    total,
    granted: grantedTotal,
    byStatus: Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count._all])
    ) as Partial<Record<EventProcessStatus, number>>
  };

  return {
    items: rows,
    total,
    page,
    pageSize,
    stats
  };
}
