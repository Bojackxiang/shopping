// Client 项目独立的 Prisma Client
import { PrismaClient } from "@prisma/client";
import { withAuditEvents } from "./audit-events";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const base = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = base;

// All writes through `db` are auto-instrumented by L3 (audit-events).
// The unwrapped `base` instance is used internally by audit-events when
// it needs to look up rows without re-entering the audit pipeline.
export const db = withAuditEvents(base) as unknown as PrismaClient;
