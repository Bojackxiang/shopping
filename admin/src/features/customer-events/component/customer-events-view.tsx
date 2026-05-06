'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  getCustomerEvents,
  type CustomerEventRow
} from '@/repositories/customer-events/customer-events';
import { CustomerEventType, EventProcessStatus } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 10;
const ALL = '__ALL__';

const TYPE_OPTIONS: CustomerEventType[] = [
  'USER_SIGNUP',
  'USER_LOGIN',
  'PAGE_VIEWED',
  'SORT_CHANGED',
  'FILTER_CHANGED',
  'SEARCH_PERFORMED',
  'CART_MODAL_OPENED',
  'FAVORITE_ADDED',
  'FAVORITE_REMOVED',
  'CART_ITEM_ADDED',
  'CART_ITEM_QUANTITY_CHANGED',
  'CART_ITEM_REMOVED',
  'ADDRESS_SAVED',
  'ADDRESS_REMOVED',
  'BIRTHDAY',
  'ORDER_CREATED',
  'ORDER_PAID',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'REVIEW_SUBMITTED',
  'REVIEW_APPROVED',
  'MILESTONE_TOTAL_SPENT',
  'MILESTONE_ORDER_COUNT'
];

const STATUS_OPTIONS: EventProcessStatus[] = [
  'PENDING',
  'PROCESSED',
  'FAILED',
  'SKIPPED'
];

type Stats = {
  total: number;
  granted: number;
  byStatus: Partial<Record<EventProcessStatus, number>>;
};

export function CustomerEventsView() {
  const [items, setItems] = useState<CustomerEventRow[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    granted: 0,
    byStatus: {}
  });
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(stats.total / PAGE_SIZE)),
    [stats.total]
  );

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      try {
        const res = await getCustomerEvents({
          page,
          pageSize: PAGE_SIZE,
          type: type === ALL ? undefined : (type as CustomerEventType),
          status: status === ALL ? undefined : (status as EventProcessStatus),
          search: search || undefined
        });
        if (cancelled) return;
        setItems(res.items);
        setStats(res.stats);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message ?? 'Failed to fetch');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page, type, status, search, refreshTick]);

  // debounce search input → search state (300ms)
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, search]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setRefreshTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const handleTypeChange = (next: string) => {
    setType(next);
    setPage(1);
  };
  const handleStatusChange = (next: string) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <div className='flex w-full min-w-0 flex-col gap-3 p-4 md:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
          <h1 className='text-xl font-semibold leading-none'>Customer Event Log</h1>
          <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
            <Stat label='Total' value={stats.total} />
            <span className='opacity-30'>·</span>
            <Stat label='Processed' value={stats.byStatus.PROCESSED ?? 0} />
            <span className='opacity-30'>·</span>
            <Stat label='Pending' value={stats.byStatus.PENDING ?? 0} />
            <span className='opacity-30'>·</span>
            <Stat
              label='Failed'
              value={stats.byStatus.FAILED ?? 0}
              variant='danger'
            />
            <span className='opacity-30'>·</span>
            <Stat
              label='Granted'
              value={stats.granted}
              variant='success'
            />
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Switch
              id='auto-refresh'
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor='auto-refresh' className='text-sm'>
              Auto-refresh
            </Label>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setRefreshTick((t) => t + 1)}
            disabled={isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card className='min-w-0 max-w-full'>
        <CardHeader className='flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between'>
          <CardTitle className='text-base'>Events</CardTitle>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative w-full min-w-[200px] sm:w-[260px]'>
              <Search className='text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2' />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Search email / name / dedupe / coupon...'
                className='pl-8 pr-8'
              />
              {searchInput && (
                <button
                  type='button'
                  onClick={() => setSearchInput('')}
                  className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2'
                  aria-label='clear search'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className='w-full min-w-[160px] sm:w-[200px]'>
                <SelectValue placeholder='All event types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All event types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className='w-full min-w-[140px] sm:w-[160px]'>
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {error && (
            <div className='border-destructive/40 bg-destructive/10 text-destructive border-b p-3 text-sm'>
              {error}
            </div>
          )}
          <TooltipProvider>
            <div className='max-h-[calc(100svh-360px)] overflow-y-auto'>
            <Table>
              <TableHeader className='bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]'>
                <TableRow>
                  <TableHead className='w-[150px] min-w-[150px]'>Occurred</TableHead>
                  <TableHead className='min-w-[140px]'>Type</TableHead>
                  <TableHead className='min-w-[140px] max-w-[200px]'>
                    Customer
                  </TableHead>
                  <TableHead className='min-w-[100px]'>Status</TableHead>
                  <TableHead className='min-w-[120px]'>Granted</TableHead>
                  <TableHead className='hidden lg:table-cell lg:max-w-[220px]'>
                    Dedupe key
                  </TableHead>
                  <TableHead className='hidden xl:table-cell xl:max-w-[260px]'>
                    Payload
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && !isPending && (
                  <TableRow>
                    <TableCell colSpan={7} className='text-muted-foreground py-10 text-center'>
                      No events yet — trigger one (sign up / favorite a product) to see it here.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className='text-xs whitespace-nowrap'>
                      {formatTime(ev.occurredAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className='whitespace-nowrap font-mono text-[10px]'
                      >
                        {ev.type}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-[200px] text-xs'>
                      <div className='truncate font-medium'>
                        {ev.customerName ?? ev.customerEmail ?? ev.customerId.slice(0, 8)}
                      </div>
                      {ev.customerEmail && ev.customerName && (
                        <div className='text-muted-foreground truncate'>
                          {ev.customerEmail}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ev.status} />
                      {ev.errorMessage && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='text-destructive ml-2 cursor-help text-[10px] underline'>
                              error
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className='max-w-md'>
                            {ev.errorMessage}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {ev.grantedCouponCode ? (
                        <div className='flex flex-col gap-0.5'>
                          <Badge className='w-fit font-mono text-xs'>
                            {ev.grantedCouponCode}
                          </Badge>
                          {ev.grantedExpiresAt && (
                            <span className='text-muted-foreground text-[10px]'>
                              exp {formatTime(ev.grantedExpiresAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className='text-muted-foreground text-xs'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='hidden lg:table-cell lg:max-w-[220px]'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code className='bg-muted block max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[11px]'>
                            {ev.dedupeKey}
                          </code>
                        </TooltipTrigger>
                        <TooltipContent className='max-w-md break-all'>
                          {ev.dedupeKey}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className='hidden xl:table-cell xl:max-w-[260px]'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code className='bg-muted text-muted-foreground block max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[11px]'>
                            {JSON.stringify(ev.payload)}
                          </code>
                        </TooltipTrigger>
                        <TooltipContent className='max-w-md'>
                          <pre className='text-[11px] whitespace-pre-wrap break-all'>
                            {JSON.stringify(ev.payload, null, 2)}
                          </pre>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </TooltipProvider>

          <div className='flex shrink-0 items-center justify-between border-t p-3'>
            <span className='text-muted-foreground text-xs'>
              Page {page} of {totalPages} • {stats.total} events total
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isPending}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isPending}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  variant = 'default'
}: {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'danger';
}) {
  const colors =
    variant === 'success'
      ? 'text-emerald-600'
      : variant === 'danger'
      ? 'text-destructive'
      : 'text-foreground';
  return (
    <span className='inline-flex items-baseline gap-1'>
      <span>{label}</span>
      <span className={`font-semibold ${colors}`}>{value}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: EventProcessStatus }) {
  const map: Record<EventProcessStatus, { label: string; cls: string }> = {
    PROCESSED: { label: 'Processed', cls: 'bg-emerald-100 text-emerald-800' },
    PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-800' },
    FAILED: { label: 'Failed', cls: 'bg-red-100 text-red-800' },
    SKIPPED: { label: 'Skipped', cls: 'bg-slate-100 text-slate-700' }
  };
  const m = map[status];
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
