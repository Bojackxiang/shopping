import { NextResponse } from 'next/server';

/**
 * Validate the request comes from Vercel Cron (or a manual curl that knows
 * the secret). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 *
 * Returns null on success, or a 401 NextResponse on failure.
 */
export function assertCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured on server' },
      { status: 500 }
    );
  }
  const auth = req.headers.get('authorization') ?? '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match || match[1] !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
