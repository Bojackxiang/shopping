'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  ChevronDown,
  Download,
  MoreVertical,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import useCoupon from '../hook/use-coupon';
import {
  CreateCouponModal,
  FormData as CouponForm
} from './create-coupon-modal';
import { useCreateCoupon } from '../hook/use-create-coupon';
import { onToastError } from '@/lib/toast';
import { anyToNumber } from '@/utils';
import { anyToDate } from '../../../utils/any-to-date';
import { useQueryState, parseAsInteger } from 'nuqs';
import { useActiveCoupon } from '../hook/use-active-coupon';
import { useRemoveCoupon } from '../hook/use-remove-coupon';
import useCouponById from '../hook/use-coupon-by-id';
import { useUpdateCoupon } from '../hook/use-update-coupon';
import { delay } from '@/constants/mock-api';

const CouponListView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 发现用 swr 中的 loading 有时候不是很好控制
  const [uiLoading, setUiLoading] = useState(false);

  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: false })
  );

  const [_, setCouponId] = useQueryState('couponId');
  const [__, setEditorMode] = useQueryState('mode'); // create | edit

  useEffect(() => {
    if (!window.location.search.includes('page=')) {
      setPage(1);
    }
  }, [setPage]);

  // hooks group
  const {
    items,
    total,
    totalPages: fetchCouponTotalPages,
    isLoading: fetchCouponLoading,
    mutate: refetch
  } = useCoupon({ page });

  const { isLoading: createCouponLoading, trigger } = useCreateCoupon();

  const {
    trigger: toggleCouponStatus,
    isLoading: toggleCouponLoading,
    error: toggleCouponError,
    data: toggleCouponData,
    reset: resetToggleCoupon
  } = useActiveCoupon();

  const {
    trigger: removeCoupon,
    isLoading: removeCouponLoading,
    error: removeCouponError,
    data: removeCouponData,
    reset: resetRemoveCoupon
  } = useRemoveCoupon();

  const {
    trigger: updateCoupon,
    isLoading: updateCouponLoading,
    error: updateCouponError,
    data: updateCouponData,
    reset: resetUpdateCoupon
  } = useUpdateCoupon();

  const isLoading =
    fetchCouponLoading ||
    createCouponLoading ||
    toggleCouponLoading ||
    removeCouponLoading ||
    updateCouponLoading ||
    uiLoading;

  const onDropDownProcess = async (
    dropdown: 'EDIT' | 'DISABLE' | 'VIEW_USAGE' | 'DELETE' | 'ACTIVATE',
    id: string
  ) => {
    // 只有数据操作才需要 loading 和 refetch
    const needsDataOperation = ['DISABLE', 'ACTIVATE', 'DELETE'].includes(
      dropdown
    );

    if (needsDataOperation) {
      setUiLoading(true);
    }

    switch (dropdown) {
      case 'EDIT':
        // 只是打开 modal，不需要 loading 或 refetch
        setCouponId(id);
        setEditorMode('edit');
        setIsCreateModalOpen(true);
        break;
      case 'DISABLE':
        await toggleCouponStatus({ id, isActive: false });
        break;
      case 'ACTIVATE':
        await toggleCouponStatus({ id, isActive: true });
        break;
      case 'VIEW_USAGE':
        // 查看使用情况，不需要 loading 或 refetch
        break;
      case 'DELETE':
        await removeCoupon({ id });
        break;
    }

    if (needsDataOperation) {
      await refetch();
      setUiLoading(false);
    }
  };

  // coupon create handler
  const onCreateCoupon = async (data: CouponForm) => {
    try {
      await trigger({
        ...data,
        value: anyToNumber(data.value),
        minPurchase: anyToNumber(data.minPurchase),
        maxDiscount: anyToNumber(data.maxDiscount),
        usageLimit: anyToNumber(data.usageLimit),
        usageLimitPerCustomer: anyToNumber(data.usageLimitPerCustomer),
        startDate: anyToDate(data.startDate),
        endDate: anyToDate(data.endDate)
      });

      // 关闭 modal
      setIsCreateModalOpen(false);

      // re-collect data
      await refetch();
    } catch (error) {
      onToastError('Error create Coupon', (error as any).message);
    }
  };

  // coupon update handler
  const onUpdateCoupon = async (id: string, data: CouponForm) => {
    try {
      await updateCoupon({
        id,
        description: data.description,
        type: data.type,
        value: anyToNumber(data.value),
        minPurchase: anyToNumber(data.minPurchase),
        maxDiscount: anyToNumber(data.maxDiscount),
        usageLimit: anyToNumber(data.usageLimit),
        usageLimitPerCustomer: anyToNumber(data.usageLimitPerCustomer),
        startDate: anyToDate(data.startDate),
        endDate: anyToDate(data.endDate),
        isActive: data.isActive
      });

      setIsCreateModalOpen(false);

      setCouponId('');
      setEditorMode(null);

      await refetch();
    } catch (error) {
      onToastError('Error update Coupon', (error as any).message);
    }
  };

  // on editor coupon open

  const processedCoupons = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];

    return items.map(
      (item: any): Coupon => ({
        id: item.id,
        name: item.description || 'No description',
        code: item.code,
        type: formatCouponType(item.type),
        status: getCouponStatus(item.isActive, item.startDate, item.endDate),
        validFrom: formatDate(item.startDate),
        validTo: formatDate(item.endDate),
        issued: item.usageLimit || 0,
        used: item.usageCount || 0
      })
    );
  }, [items]);

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Coupon Name',
        cell: ({ row }) => (
          <div className='text-foreground font-medium whitespace-nowrap'>
            {row.getValue('name')}
          </div>
        )
      },
      {
        accessorKey: 'code',
        header: 'Coupon Code',
        cell: ({ row }) => (
          <div className='text-muted-foreground font-mono text-sm whitespace-nowrap'>
            {row.getValue('code')}
          </div>
        )
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <div className='text-foreground whitespace-nowrap'>
            {row.getValue('type')}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const statusBadge = getStatusBadge(status);
          return (
            <Badge
              variant={statusBadge.variant}
              className={statusBadge.className}
            >
              {status}
            </Badge>
          );
        }
      },
      {
        id: 'validPeriod',
        header: 'Valid Period',
        cell: ({ row }) => (
          <div className='text-muted-foreground text-sm whitespace-nowrap'>
            {row.original.validFrom} → {row.original.validTo}
          </div>
        )
      },
      {
        accessorKey: 'issued',
        header: 'Issued',
        cell: ({ row }) => (
          <div className='text-foreground text-right whitespace-nowrap'>
            {(row.getValue('issued') as number).toLocaleString()}
          </div>
        )
      },
      {
        accessorKey: 'used',
        header: 'Used',
        cell: ({ row }) => (
          <div className='text-foreground text-right whitespace-nowrap'>
            {(row.getValue('used') as number).toLocaleString()}
          </div>
        )
      },
      {
        id: 'usageRate',
        header: 'Usage Rate',
        cell: ({ row }) => {
          const usageRate = calculateUsageRate(
            row.original.used,
            row.original.issued
          );
          return (
            <div className='flex items-center gap-2 whitespace-nowrap'>
              <Progress value={usageRate} className='h-2 w-24' />
              <span className='text-muted-foreground text-xs'>
                {usageRate.toFixed(0)}%
              </span>
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='text-right whitespace-nowrap'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => {
                    onDropDownProcess('EDIT', row.original.id);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onDropDownProcess('VIEW_USAGE', row.original.id);
                  }}
                >
                  View Usage
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='!text-warning'
                  disabled={row.original.status === 'disabled'}
                  onClick={() => {
                    onDropDownProcess('DISABLE', row.original.id);
                  }}
                >
                  Disable
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='!text-success'
                  disabled={row.original.status === 'active'}
                  onClick={() => {
                    onDropDownProcess('ACTIVATE', row.original.id);
                  }}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='!text-destructive'
                  onClick={() => {
                    onDropDownProcess('DELETE', row.original.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: processedCoupons,
    columns,
    state: {
      sorting,
      columnFilters
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
    // 不使用客户端分页，使用服务器分页
  });

  return (
    <PageContainer scrollable={false}>
      <div className='w-full overflow-auto'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-foreground text-2xl font-bold text-balance md:text-3xl'>
              Coupon Management
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              Manage all coupons and their lifecycle
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='hidden bg-transparent sm:flex'
            >
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='hidden bg-transparent sm:flex'
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Button
              size='sm'
              onClick={() => setIsCreateModalOpen(true)}
              className='flex-1 sm:flex-none'
            >
              <Plus className='mr-2 h-4 w-4' />
              <span className='hidden sm:inline'>Create Coupon</span>
              <span className='sm:hidden'>Create</span>
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className='border-border bg-card mb-6 rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='text-foreground flex items-center gap-2 text-sm font-medium'
            >
              Filters
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
            {showFilters && (
              <div className='flex gap-2'>
                <Button variant='outline' size='sm'>
                  Apply
                </Button>
                <Button variant='ghost' size='sm'>
                  Reset
                </Button>
              </div>
            )}
          </div>
          {showFilters && (
            <div className='mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
              <div className='relative'>
                <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  placeholder='Search by name or code...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9'
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='draft'>Draft</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='expired'>Expired</SelectItem>
                  <SelectItem value='disabled'>Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Input type='date' placeholder='Date range' />
            </div>
          )}
        </div>

        {/* Table */}
        <div className='border-border bg-card overflow-hidden rounded-lg border'>
          <ScrollArea className='h-full w-full'>
            <Table>
              <TableHeader className='bg-muted/80'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className='hover:bg-transparent'
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className='bg-muted/80 font-semibold whitespace-nowrap'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className='group'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center'
                    >
                      No coupons found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>

        {/* Pagination */}
        <div className='mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Showing page {page} of {fetchCouponTotalPages} ({total} total
            coupons)
          </p>
          <div className='flex items-center gap-4'>
            <span className='text-muted-foreground text-sm'>
              Page {page} / {fetchCouponTotalPages}
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(page + 1)}
                disabled={page >= fetchCouponTotalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CreateCouponModal
        open={isCreateModalOpen}
        onOpenChange={(state) => {
          setIsCreateModalOpen(state);
          if (!state) {
            setCouponId('');
            setEditorMode(null);
          }
        }}
        onCreate={onCreateCoupon}
        onUpdate={onUpdateCoupon}
      />
    </PageContainer>
  );
};

export default CouponListView;

type Coupon = {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  validFrom: string;
  validTo: string;
  issued: number;
  used: number;
};

const calculateUsageRate = (used: number, issued: number | null) => {
  if (!issued || issued === 0) return 0;
  return (used / issued) * 100;
};

const formatCouponType = (type: string) => {
  switch (type) {
    case 'PERCENTAGE':
      return 'Percentage';
    case 'FIXED_AMOUNT':
      return 'Amount';
    case 'FREE_SHIPPING':
      return 'Free Shipping';
    default:
      return type;
  }
};

const getCouponStatus = (
  isActive: boolean,
  startDate: string,
  endDate: string
) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!isActive) return 'disabled';
  if (now < start) return 'draft';
  if (now > end) return 'expired';
  return 'active';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-');
};

const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    {
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      className: string;
    }
  > = {
    active: {
      variant: 'default',
      className: 'bg-success text-success-foreground'
    },
    draft: {
      variant: 'secondary',
      className: 'bg-muted text-muted-foreground'
    },
    expired: {
      variant: 'outline',
      className: 'border-muted-foreground/50 text-muted-foreground'
    },
    disabled: {
      variant: 'destructive',
      className: 'bg-destructive/20 text-destructive'
    }
  };
  return variants[status] || variants.draft;
};
