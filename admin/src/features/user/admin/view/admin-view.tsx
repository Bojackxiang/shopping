'use client';

import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';

import { IconRefresh } from '@tabler/icons-react';
import { AdminUserResponse } from '../type/admin-type';
import { Separator } from '@/components/ui/separator';

const AdminTable = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const fetchAdminUsers = async (offset: number = 0) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/user/admin?limit=${pageSize}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AdminUserResponse = await response.json();
      setAdminUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
      toast.error(`Error fetching admin users: ${(err as Error).message}`);
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers(0);
  }, []);

  const onNextPageClick = () => {
    const nextOffset = (currentPage + 1) * pageSize;
    setCurrentPage(currentPage + 1);
    fetchAdminUsers(nextOffset);
  };

  const onPreviousPageClick = () => {
    const prevOffset = Math.max(0, (currentPage - 1) * pageSize);
    setCurrentPage(Math.max(0, currentPage - 1));
    fetchAdminUsers(prevOffset);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const canGoNext = adminUsers?.pagination.hasMore || false;
  const canGoPrev = currentPage > 0;

  if (loading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} filterCount={0} />;
  }

  return (
    <div className='space-y-4'>
      {adminUsers && (
        <>
          {/* Statistics Card */}
          <div className='bg-card rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <h3 className='text-lg font-medium'>Admin User</h3>
                <p className='text-muted-foreground text-sm'>
                  Total: {adminUsers.totalCount} Admin / Normal User • Page{' '}
                  {currentPage + 1} of{' '}
                  {Math.ceil(adminUsers.totalCount / pageSize)}
                </p>
              </div>
            </div>
          </div>

          {/* AdminUser Table */}
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
                {adminUsers.data.map((admin) => {
                  return (
                    <TableRow key={admin.id}>
                      <TableCell>
                        {admin.imageUrl ? (
                          <img
                            src={admin.imageUrl}
                            alt={
                              `${admin.firstName || ''} ${admin.lastName || ''}`.trim() ||
                              'User'
                            }
                            className='h-10 w-10 rounded-full object-cover'
                          />
                        ) : (
                          <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium'>
                            {(
                              (admin.firstName?.[0] || '') +
                                (admin.lastName?.[0] || '') || '?'
                            ).toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='font-medium'>
                            {admin.firstName || admin.lastName
                              ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim()
                              : 'No name provided'}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            ID: {admin.id.slice(-8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='font-mono text-sm'>
                        {admin.emailAddresses[0]?.emailAddress || 'No email'}
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge
                          variant={
                            admin.publicMetadata?.role === 'admin'
                              ? 'default'
                              : 'secondary'
                          }
                          className='capitalize'
                        >
                          {admin.publicMetadata?.role || 'Non Admin'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {formatDate(admin.createdAt)}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {admin.lastSignInAt
                          ? formatDate(admin.lastSignInAt)
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
              {Math.min((currentPage + 1) * pageSize, adminUsers.totalCount)} of{' '}
              {adminUsers.totalCount} entries
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

const AdminView = () => {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Admin Users'
            description='Manage admin accounts and user data.'
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
          <AdminTable />
        </Suspense>
      </div>
    </PageContainer>
  );
};

export default AdminView;
