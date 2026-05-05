import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { CustomerRepo } from "@/repo";
import { emitCustomerEvent } from "@/lib/events/dispatcher";
import { CustomerEventType } from "@prisma/client";

const ALLOWED_TYPES = new Set<CustomerEventType>([
  CustomerEventType.PAGE_VIEWED,
  CustomerEventType.SORT_CHANGED,
  CustomerEventType.FILTER_CHANGED,
  CustomerEventType.SEARCH_PERFORMED,
  CustomerEventType.CART_MODAL_OPENED,
]);

type IncomingEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

export async function POST(req: Request) {
  let user: Awaited<ReturnType<typeof currentUser>> | null = null;
  try {
    user = await currentUser();
  } catch {
    /* unauth: drop silently */
  }
  if (!user) return NextResponse.json({ ok: true, dropped: "anon" });

  const customer = await CustomerRepo.fetchCustomerByClerkId(user.id);
  if (!customer) return NextResponse.json({ ok: true, dropped: "no-customer" });

  const body = (await req.json().catch(() => null)) as
    | { events?: IncomingEvent[] }
    | null;
  const events = body?.events ?? [];

  await Promise.allSettled(
    events
      .filter((e) =>
        ALLOWED_TYPES.has(e.type as CustomerEventType),
      )
      .map((e) =>
        emitCustomerEvent({
          type: e.type as CustomerEventType,
          customerId: customer.id,
          payload: (e.payload ?? {}) as never,
        }),
      ),
  );

  return NextResponse.json({ ok: true, accepted: events.length });
}
