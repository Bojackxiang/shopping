import { useState, useMemo } from 'react';
import {
  IconRefresh,
  IconUsers,
  IconUserCheck,
  IconShield,
  IconArrowsSort,
  IconChevronDown,
  IconColumns
} from '@tabler/icons-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState
} from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import UserDetailDialog from '../component/admin-detail-dialog';
import { useOrgMemberList } from '../hook/user-org-member';

// Type definitions based on your data structure
type PublicUserData = {
  identifier: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  hasImage: boolean;
  userId: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  hasImage: boolean;
  createdAt: number;
  updatedAt: number;
  maxAllowedMemberships: number;
  adminDeleteEnabled: boolean;
  createdBy: string;
};

type OrganizationMembership = {
  id: string;
  role: string;
  permissions: string[];
  publicMetadata: Record<string, any>;
  privateMetadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  organization: Organization;
  publicUserData: PublicUserData;
};

export const AdminTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { data, isLoading, error, refetch } = useOrgMemberList();
  console.log(JSON.stringify(data, null, 2));

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'org:admin':
        return 'destructive';
      case 'org:member':
      default:
        return 'secondary';
    }
  };

  const getRoleName = (role: string) => {
    return role?.replace('org:', '') || 'member';
  };

  // Define columns using TanStack Table
  const columns = useMemo<ColumnDef<OrganizationMembership>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
            className='translate-y-[2px]'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
            className='translate-y-[2px]'
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 48
      },
      {
        accessorKey: 'publicUserData.imageUrl',
        id: 'avatar',
        header: 'Avatar',
        enableSorting: false,
        size: 80,
        cell: ({ row }) => {
          const userData = row.original.publicUserData;
          return (
            <div className='flex items-center justify-center'>
              {userData?.imageUrl ? (
                <img
                  src={userData.imageUrl}
                  alt={
                    `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                    'User'
                  }
                  className='h-10 w-10 flex-shrink-0 rounded-full object-cover'
                />
              ) : (
                <div className='bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium'>
                  {(
                    (userData?.firstName?.[0] || '') +
                      (userData?.lastName?.[0] || '') || '?'
                  ).toUpperCase()}
                </div>
              )}
            </div>
          );
        }
      },
      {
        accessorFn: (row) =>
          `${row.publicUserData?.firstName || ''} ${row.publicUserData?.lastName || ''}`.trim() ||
          'No name',
        id: 'member',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-8'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Member
            <IconArrowsSort className='ml-2 h-4 w-4' />
          </Button>
        ),
        size: 180,
        cell: ({ row }) => {
          const userData = row.original.publicUserData;
          return (
            <div className='space-y-1' style={{ minWidth: '150px' }}>
              <div className='font-medium'>
                {userData?.firstName || userData?.lastName
                  ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
                  : 'No name'}
              </div>
              <div className='text-muted-foreground text-xs'>
                ID: {row.original.id.slice(-8)}
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'publicUserData.identifier',
        id: 'email',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-8'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <IconArrowsSort className='ml-2 h-4 w-4' />
          </Button>
        ),
        size: 220,
        cell: ({ getValue }) => (
          <span
            className='block font-mono text-sm'
            style={{ minWidth: '180px' }}
          >
            {(getValue() as string) || 'No email'}
          </span>
        )
      },
      {
        accessorKey: 'organization.name',
        id: 'organization',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-8'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Organization
            <IconArrowsSort className='ml-2 h-4 w-4' />
          </Button>
        ),
        size: 180,
        cell: ({ row }) => {
          const orgData = row.original.organization;
          return (
            <div
              className='flex items-center gap-2'
              style={{ minWidth: '150px' }}
            >
              {orgData?.imageUrl && (
                <img
                  src={orgData.imageUrl}
                  alt={orgData.name}
                  className='h-6 w-6 flex-shrink-0 rounded'
                />
              )}
              <div className='min-w-0'>
                <div className='truncate font-medium'>{orgData?.name}</div>
                <div className='text-muted-foreground truncate text-xs'>
                  {orgData?.slug}
                </div>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 120,
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return (
            <div className='flex justify-center'>
              <Badge
                variant={getRoleVariant(role)}
                className='whitespace-nowrap capitalize'
              >
                {getRoleName(role)}
              </Badge>
            </div>
          );
        }
      },
      {
        accessorKey: 'permissions',
        header: 'Perms',
        enableSorting: false,
        size: 100,
        cell: ({ getValue }) => {
          const permissions = getValue() as string[];
          return (
            <div className='flex justify-center'>
              <Badge variant='outline' className='text-xs whitespace-nowrap'>
                {permissions?.length || 0}
              </Badge>
            </div>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-8'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Joined
            <IconArrowsSort className='ml-2 h-4 w-4' />
          </Button>
        ),
        size: 110,
        cell: ({ getValue }) => (
          <div className='text-muted-foreground text-center text-sm whitespace-nowrap'>
            {formatDate(getValue() as number)}
          </div>
        )
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <Button
            variant='ghost'
            size='sm'
            className='-ml-2 h-8'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Updated
            <IconArrowsSort className='ml-2 h-4 w-4' />
          </Button>
        ),
        size: 110,
        cell: ({ getValue }) => (
          <div className='text-muted-foreground text-center text-sm whitespace-nowrap'>
            {formatDate(getValue() as number)}
          </div>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        size: 100,
        cell: ({ row }) => {
          const userData = row.original.publicUserData;
          return (
            <div className='flex justify-center'>
              <UserDetailDialog adminUserId={userData?.userId} />
            </div>
          );
        }
      }
    ],
    []
  );

  const membershipList = data?.data?.data || [];

  const table = useReactTable({
    data: membershipList,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='bg-card rounded-lg border p-4'>
              <div className='flex items-center space-x-2'>
                <div className='bg-muted h-4 w-4 animate-pulse rounded' />
                <div className='bg-muted h-4 w-16 animate-pulse rounded' />
              </div>
              <div className='mt-2'>
                <div className='bg-muted h-8 w-12 animate-pulse rounded' />
                <div className='bg-muted mt-1 h-3 w-24 animate-pulse rounded' />
              </div>
            </div>
          ))}
        </div>
        <DataTableSkeleton columnCount={9} rowCount={10} filterCount={0} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-4'>
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <div className='mb-2 flex items-center gap-2'>
            <IconUsers className='h-5 w-5 text-red-600' />
            <h3 className='font-medium text-red-800'>
              Failed to load memberships
            </h3>
          </div>
          <p className='mb-3 text-sm text-red-700'>{error.message || error}</p>
          <Button variant='outline' size='sm' onClick={refetch}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data?.data?.data || data.data.data.length === 0) {
    return (
      <div className='space-y-4'>
        <div className='bg-card rounded-lg border p-8 text-center'>
          <IconUsers className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-medium'>No memberships found</h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            There are no organization memberships yet.
          </p>
          <Button variant='outline' onClick={refetch}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const totalCount = data.data.totalCount;

  // Calculate statistics
  const adminMembers = membershipList.filter(
    (member: OrganizationMembership) => member.role === 'org:admin'
  ).length;
  const recentlyJoined = membershipList.filter(
    (member: OrganizationMembership) => {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return member.createdAt > dayAgo;
    }
  ).length;

  return (
    <div className='space-y-6'>
      {/* Search and Controls */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <Input
            placeholder='Filter by email...'
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('email')?.setFilterValue(event.target.value)
            }
            className='w-full sm:max-w-sm'
          />
        </div>
        <div className='flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='ml-auto'>
                <IconColumns className='mr-2 h-4 w-4' />
                Columns
                <IconChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            className='whitespace-nowrap'
          >
            <IconRefresh className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='bg-card rounded-lg border p-4'>
          <div className='flex items-center space-x-2'>
            <IconUsers className='h-4 w-4 flex-shrink-0 text-blue-600' />
            <span className='text-sm font-medium'>Total Members</span>
          </div>
          <div className='mt-2'>
            <div className='text-2xl font-bold'>{totalCount}</div>
            <p className='text-muted-foreground text-xs'>
              Organization members
            </p>
          </div>
        </div>

        <div className='bg-card rounded-lg border p-4'>
          <div className='flex items-center space-x-2'>
            <IconShield className='h-4 w-4 flex-shrink-0 text-amber-600' />
            <span className='text-sm font-medium'>Admins</span>
          </div>
          <div className='mt-2'>
            <div className='text-2xl font-bold'>{adminMembers}</div>
            <p className='text-muted-foreground text-xs'>Admin members</p>
          </div>
        </div>

        <div className='bg-card rounded-lg border p-4 sm:col-span-2 lg:col-span-1'>
          <div className='flex items-center space-x-2'>
            <IconUserCheck className='h-4 w-4 flex-shrink-0 text-green-600' />
            <span className='text-sm font-medium'>Recently Joined</span>
          </div>
          <div className='mt-2'>
            <div className='text-2xl font-bold'>{recentlyJoined}</div>
            <p className='text-muted-foreground text-xs'>Last 24 hours</p>
          </div>
        </div>
      </div>

      {/* Membership Table with TanStack Table */}
      <div className='space-y-4'>
        <div className='text-muted-foreground block text-center text-xs sm:hidden'>
          ← Swipe horizontally to view all columns →
        </div>
        <div className='overflow-hidden rounded-md border'>
          <div className='w-full overflow-x-auto'>
            <Table className='min-w-max sm:min-w-full'>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-between'>
          <div className='text-muted-foreground text-sm'>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
