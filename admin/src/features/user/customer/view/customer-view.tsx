'use client';

import { Suspense, useEffect, useState } from 'react';
import { IconRefresh } from '@tabler/icons-react';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { CustomerResponse } from '../types/customer-type';

const CustomerTable = () => {
  const [customers, setCustomers] = useState<CustomerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchCustomers = async (offset: number = 0) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/user/customer?limit=${pageSize}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CustomerResponse = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch customers'
      );
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(0);
  }, []);

  const onNextPageClick = () => {
    const nextOffset = (currentPage + 1) * pageSize;
    setCurrentPage(currentPage + 1);
    fetchCustomers(nextOffset);
  };

  const onPreviousPageClick = () => {
    const prevOffset = Math.max(0, (currentPage - 1) * pageSize);
    setCurrentPage(Math.max(0, currentPage - 1));
    fetchCustomers(prevOffset);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canGoNext = customers?.pagination.hasMore || false;
  const canGoPrev = currentPage > 0;

  if (loading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={0} />;
  }

  if (error) {
    return (
      <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
        <p className='text-red-700'>Error: {error}</p>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fetchCustomers(currentPage * pageSize)}
          className='mt-2'
        >
          <IconRefresh className='mr-2 h-4 w-4' />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {customers && (
        <>
          {/* Statistics Card */}
          <div className='bg-card rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='text-lg font-medium'>Customer Overview</h3>
                <p className='text-muted-foreground text-sm'>
                  Total: {customers.totalCount} customers • Page{' '}
                  {currentPage + 1} of{' '}
                  {Math.ceil(customers.totalCount / pageSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className='bg-card rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-16'>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className='w-20'>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className='w-32'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.data.map((customer) => {
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        {customer.imageUrl ? (
                          <img
                            src={customer.imageUrl}
                            alt={
                              `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
                              'User'
                            }
                            className='h-10 w-10 rounded-full object-cover'
                          />
                        ) : (
                          <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium'>
                            {(
                              (customer.firstName?.[0] || '') +
                                (customer.lastName?.[0] || '') || '?'
                            ).toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='font-medium'>
                            {customer.firstName || customer.lastName
                              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                              : 'No name provided'}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            ID: {customer.id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {customer.emailAddresses[0]?.emailAddress || 'No email'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.publicMetadata?.role === 'admin'
                              ? 'default'
                              : 'secondary'
                          }
                          className='capitalize'
                        >
                          {customer.publicMetadata?.role || 'Customer'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {formatDate(customer.createdAt)}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {customer.lastSignInAt
                          ? formatDate(customer.lastSignInAt)
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button variant='ghost' size='sm'>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              Showing {currentPage * pageSize + 1} to{' '}
              {Math.min((currentPage + 1) * pageSize, customers.totalCount)} of{' '}
              {customers.totalCount} entries
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={onPreviousPageClick}
                disabled={!canGoPrev}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={onNextPageClick}
                disabled={!canGoNext}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CustomerView = () => {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Customers'
            description='Manage customer accounts and user data.'
          />
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.location.reload()}
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={7} rowCount={10} filterCount={0} />
          }
        >
          <CustomerTable />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default CustomerView;
