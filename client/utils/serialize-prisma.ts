/**
 * Deep convert a Prisma-shaped object tree into plain JS values safe to send
 * across the React Server Components / Server Actions boundary.
 *
 * - Decimal → number
 * - Date → ISO string
 * - everything else: walked recursively
 */

function isDecimalLike(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof (o as { toNumber?: unknown }).toNumber === "function" &&
    typeof (o as { toString?: unknown }).toString === "function" &&
    typeof (o as { s?: unknown }).s === "number"
  );
}

export function serializePrisma<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((v) => serializePrisma(v)) as unknown as T;
  }
  if (value instanceof Date) {
    return value.toISOString() as unknown as T;
  }
  if (isDecimalLike(value)) {
    return Number(
      (value as { toString: () => string }).toString(),
    ) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializePrisma(v);
    }
    return out as unknown as T;
  }
  return value;
}
