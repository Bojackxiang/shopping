'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerData } from '../hook/use-customer-data';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CustomerDetailDialog from './customer-dialog';

interface CustomerTableProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
    orderBy?: 'createdAt' | 'email' | 'firstName';
  };
}

const CustomerTable = ({ searchParams }: CustomerTableProps) => {
  const router = useRouter();
  const params = useSearchParams();

  const currentPage = parseInt(searchParams?.page || '1');
  const currentPageSize = parseInt(searchParams?.pageSize || '10');

  const { customers, pagination, loading, error, refetch } = useCustomerData({
    page: currentPage,
    pageSize: currentPageSize,
    orderBy:
      (searchParams?.orderBy as 'createdAt' | 'email' | 'firstName') ||
      'createdAt'
  });

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set('page', page.toString());
    router.push(`?${newParams.toString()}`);
  };

  const handlePageSizeChange = (pageSize: string) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set('pageSize', pageSize);
    newParams.set('page', '1'); // Reset to first page when changing page size
    router.push(`?${newParams.toString()}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <DataTableSkeleton columnCount={5} rowCount={10} filterCount={0} />;
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 p-8'>
        <p className='text-destructive'>Error: {error}</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>
          Customers ({pagination?.total || 0})
        </h2>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>
              Rows per page:
            </span>
            <Select
              value={currentPageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className='w-[70px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5</SelectItem>
                <SelectItem value='10'>10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={refetch} variant='outline' size='sm'>
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage
                          src={customer.imageUrl || undefined}
                          alt={`${customer.firstName} ${customer.lastName}`}
                        />
                        <AvatarFallback>
                          {customer.firstName?.[0]}
                          {customer.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {customer.firstName} {customer.lastName}
                        </span>
                        {customer.username && (
                          <span className='text-muted-foreground text-xs'>
                            @{customer.username}
                          </span>
                        )}
                        {!customer.firstName && !customer.lastName && (
                          <span className='text-muted-foreground text-xs font-bold'>
                            Name is Empty
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-muted-foreground font-mono text-xs'>
                      {customer.clerkId}
                    </span>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className='text-right'>
                    <CustomerDetailDialog customerId={customer.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-muted-foreground h-24 text-center'
                >
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-center'>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={page === currentPage}
                    className='cursor-pointer'
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(
                      Math.min(pagination.totalPages, currentPage + 1)
                    )
                  }
                  className={
                    currentPage === pagination.totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
