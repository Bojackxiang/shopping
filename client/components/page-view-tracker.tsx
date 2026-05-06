"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CustomerEventType } from "@prisma/client";
import { track } from "@/lib/tracker";

/**
 * L1 — fires PAGE_VIEWED for every client-side route change.
 *
 * Mounts in the root layout. Skips API / auth / asset paths so we don't
 * pollute the log with non-user navigation.
 */
const SKIP_PREFIXES = ["/api", "/_next", "/auth", "/favicon"];

export default function PageViewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const qs = search?.toString();
    const fullPath = qs ? `${pathname}?${qs}` : pathname;

    if (lastTrackedRef.current === fullPath) return;
    lastTrackedRef.current = fullPath;

    track(CustomerEventType.PAGE_VIEWED, {
      path: fullPath,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [pathname, search]);

  return null;
}
