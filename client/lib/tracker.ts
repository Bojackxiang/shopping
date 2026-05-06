"use client";

/**
 * Tiny client-side event tracker for L2 (UI events that never reach a
 * server action). Events are batched in memory and flushed:
 * - every {FLUSH_INTERVAL_MS}
 * - on visibilitychange → hidden / before-unload (using fetch keepalive)
 */

import type { CustomerEventType } from "@prisma/client";

type TrackEvent = {
  type: CustomerEventType;
  payload?: Record<string, unknown>;
  ts: number;
};

const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE_SIZE = 200;

const queue: TrackEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let listenersAttached = false;

export function track(
  type: CustomerEventType,
  payload?: Record<string, unknown>,
) {
  queue.push({ type, payload, ts: Date.now() });
  if (queue.length > MAX_QUEUE_SIZE) queue.splice(0, queue.length - MAX_QUEUE_SIZE);
  scheduleFlush();
  attachUnloadListenersOnce();
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
}

async function flush() {
  if (queue.length === 0) return;
  const batch = queue.splice(0);
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
  } catch {
    // Re-queue best-effort; if user is leaving we just drop these.
    queue.unshift(...batch);
  }
}

function attachUnloadListenersOnce() {
  if (typeof window === "undefined" || listenersAttached) return;
  listenersAttached = true;
  window.addEventListener("beforeunload", () => {
    if (queue.length > 0) flush();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && queue.length > 0) flush();
  });
}
