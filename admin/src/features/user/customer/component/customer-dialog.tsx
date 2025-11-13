'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { useUserDetail } from '@/hooks/use-api';
import { useCustomerData } from '../hook/use-customer-data';
import useCustomerDetail from '../hook/use-customer-detail';

const CustomerDetailDialog = ({ customerId }: CustomerDetailDialogProp) => {
  const [isOpen, setIsOpen] = useState(false);

  // 使用 enabled 参数，只在对话框打开时才获取数据
  const { data, error, loading, refetch } = useCustomerDetail({
    id: customerId,
    enabled: isOpen
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  // 当对话框首次打开且没有数据时，手动触发获取
  useEffect(() => {
    if (isOpen && !data && !loading && !error) {
      refetch(customerId);
    }
  }, [isOpen, data, loading, error, customerId, refetch]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='w-full text-xs'>
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-medium'>
            User Information
          </DialogTitle>
          <DialogDescription className='text-muted-foreground text-sm'>
            View user account details and information.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {loading && (
            <div className='flex items-center justify-center py-8'>
              <div className='border-primary h-4 w-4 animate-spin rounded-full border-2 border-r-transparent' />
              <span className='text-muted-foreground ml-2 text-sm'>
                Loading...
              </span>
            </div>
          )}

          {error && (
            <div className='border-destructive/20 bg-destructive/5 rounded-lg border p-4'>
              <div className='flex items-start gap-3'>
                <div className='bg-destructive/20 mt-0.5 h-4 w-4 rounded-full' />
                <div className='flex-1'>
                  <h4 className='text-destructive text-sm font-medium'>
                    Failed to load user details
                  </h4>
                  <p className='text-destructive/80 mt-1 text-xs'>
                    {error || 'Something went wrong'}
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => refetch(customerId)}
                    className='mt-3 h-8 text-xs'
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {data && !loading && !error && (
            <div className='space-y-6'>
              {/* User Profile Section */}
              <div className='flex items-start gap-4'>
                <Avatar className='ring-primary/10 h-16 w-16 ring-2'>
                  <AvatarImage
                    src={data.imageUrl || undefined}
                    alt={`${data.firstName} ${data.lastName}`}
                  />
                  <AvatarFallback className='bg-primary/5 text-primary text-lg font-medium'>
                    {data.firstName?.[0] || data.email[0].toUpperCase()}
                    {data.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 space-y-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-base font-semibold'>
                      {data.firstName && data.lastName
                        ? `${data.firstName} ${data.lastName}`
                        : data.username || 'Anonymous User'}
                    </h3>
                    <Badge
                      variant={data.role === 'admin' ? 'default' : 'secondary'}
                      className='text-xs'
                    >
                      {data.role}
                    </Badge>
                  </div>
                  <p className='text-muted-foreground text-sm'>{data.email}</p>
                  {data.username && (
                    <p className='text-muted-foreground text-xs'>
                      @{data.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className='border-border border-t' />

              {/* User Details Grid */}
              <div className='grid gap-4'>
                {/* Contact Information */}
                <div className='space-y-3'>
                  <h4 className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    Contact Information
                  </h4>
                  <div className='space-y-2'>
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-xs font-medium'>
                        Email
                      </span>
                      <span className='text-sm'>{data.email}</span>
                    </div>
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-xs font-medium'>
                        Phone
                      </span>
                      <span className='text-sm'>
                        {data.phone || (
                          <span className='text-muted-foreground italic'>
                            Not provided
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className='space-y-3'>
                  <h4 className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    Account Information
                  </h4>
                  <div className='space-y-2'>
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-xs font-medium'>
                        User ID
                      </span>
                      <span className='font-mono text-xs'>
                        {data.id.slice(0, 12)}...
                      </span>
                    </div>
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-xs font-medium'>
                        Clerk ID
                      </span>
                      <span className='font-mono text-xs'>
                        {data.clerkId.slice(0, 12)}...
                      </span>
                    </div>
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-xs font-medium'>
                        Created At
                      </span>
                      <span className='text-sm'>
                        {new Date(data.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className='bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-xs font-medium'>
                        Last Updated
                      </span>
                      <span className='text-sm'>
                        {new Date(data.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' size='sm' onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {data && (
            <Button
              variant='default'
              size='sm'
              onClick={() => refetch(customerId)}
              disabled={loading}
            >
              Refresh
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailDialog;
