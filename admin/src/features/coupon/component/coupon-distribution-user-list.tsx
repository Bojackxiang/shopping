'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Customer } from '@/repositories/customer/customer.types';
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

interface CouponDistributionUserListProps {
  users: Customer[];
  selectedUserIds: string[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onToggleUser: (id: string) => void;
  onSelectPageAll: () => void;
  onDeselectPageAll: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function CouponDistributionUserList({
  users,
  selectedUserIds,
  isLoading,
  page,
  pageSize,
  total,
  totalPages,
  onToggleUser,
  onSelectPageAll,
  onDeselectPageAll,
  onPageChange,
  onPageSizeChange
}: CouponDistributionUserListProps) {
  const currentPageIds = users.map((u) => u.id);
  const allPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedUserIds.includes(id));
  const somePageSelected =
    !allPageSelected &&
    currentPageIds.some((id) => selectedUserIds.includes(id));

  const handleHeaderCheckbox = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      onSelectPageAll();
    } else {
      onDeselectPageAll();
    }
  };

  const formatName = (user: Customer) => {
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return full || user.username || '—';
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

  return (
    <div className='space-y-3'>
      {/* Selection summary bar */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-muted-foreground text-sm'>
          <span className='text-foreground font-medium'>
            {selectedUserIds.length}
          </span>{' '}
          / {total} users selected
        </p>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={onSelectPageAll}
            disabled={isLoading || allPageSelected}
          >
            Select This Page
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={onDeselectPageAll}
            disabled={isLoading || selectedUserIds.length === 0}
          >
            Deselect All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='border-border overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    allPageSelected
                      ? true
                      : somePageSelected
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={handleHeaderCheckbox}
                  disabled={isLoading || users.length === 0}
                  aria-label='Select all on this page'
                />
              </TableHead>
              <TableHead className='font-semibold whitespace-nowrap'>
                Name
              </TableHead>
              <TableHead className='font-semibold whitespace-nowrap'>
                Email
              </TableHead>
              <TableHead className='font-semibold whitespace-nowrap'>
                Role
              </TableHead>
              <TableHead className='font-semibold whitespace-nowrap'>
                Registered
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map(
                (_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className='h-4 w-4' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-32' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-44' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-16' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                  </TableRow>
                )
              )
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-muted-foreground py-10 text-center text-sm'
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  data-state={
                    selectedUserIds.includes(user.id) ? 'selected' : undefined
                  }
                  className='cursor-pointer'
                  onClick={() => onToggleUser(user.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => onToggleUser(user.id)}
                      aria-label={`Select ${formatName(user)}`}
                    />
                  </TableCell>
                  <TableCell className='text-foreground font-medium whitespace-nowrap'>
                    {formatName(user)}
                  </TableCell>
                  <TableCell className='text-muted-foreground whitespace-nowrap'>
                    {user.email}
                  </TableCell>
                  <TableCell className='whitespace-nowrap capitalize'>
                    {user.role}
                  </TableCell>
                  <TableCell className='text-muted-foreground whitespace-nowrap'>
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex flex-col-reverse items-center justify-between gap-4 sm:flex-row'>
        {/* Rows per page */}
        <div className='flex items-center gap-2'>
          <p className='text-sm font-medium whitespace-nowrap'>Rows per page</p>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            disabled={isLoading}
          >
            <SelectTrigger className='h-8 w-[4.5rem]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side='top'>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info + nav */}
        <div className='flex items-center gap-4'>
          <p className='text-sm font-medium whitespace-nowrap'>
            Page {page} of {totalPages || 1}
          </p>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              className='hidden size-8 lg:flex'
              onClick={() => onPageChange(1)}
              disabled={isLoading || page <= 1}
              aria-label='First page'
            >
              <ChevronsLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => onPageChange(page - 1)}
              disabled={isLoading || page <= 1}
              aria-label='Previous page'
            >
              <ChevronLeft className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => onPageChange(page + 1)}
              disabled={isLoading || page >= totalPages}
              aria-label='Next page'
            >
              <ChevronRight className='size-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='hidden size-8 lg:flex'
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading || page >= totalPages}
              aria-label='Last page'
            >
              <ChevronsRight className='size-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
