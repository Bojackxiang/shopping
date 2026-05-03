'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Download, RefreshCw, Tag } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import useCoupon from '../hook/use-coupon';
import type { coupons as PrismaCoupon } from '@prisma/client';
import { Input } from '@/components/ui/input';
import useUserList from '@/hooks/use-user-list';
import CouponDistributionUserList from './coupon-distribution-user-list';

type CouponItem = Omit<
  PrismaCoupon,
  'value' | 'startDate' | 'endDate' | 'createdAt'
> & {
  value: number;
  startDate: string;
  endDate: string;
  createdAt: string;
};

const CouponDistributionView = () => {
  const { data: couponResponse } = useCoupon();
  const activeCoupons = (couponResponse?.items || []) as CouponItem[];

  const [selectedCoupon, setSelectedCoupon] = useState<CouponItem | undefined>(
    undefined
  );
  const [distributionType, setDistributionType] = useState('automatic');

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  useEffect(() => {
    if (!selectedCoupon) return;
    const fresh = activeCoupons.find((c) => c.id === selectedCoupon.id);
    if (fresh) {
      if (fresh !== selectedCoupon) setSelectedCoupon(fresh);
    } else {
      setSelectedCoupon(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCoupons]);

  const {
    data: users,
    isLoading: isLoadingUsers,
    total: userTotal,
    totalPages: userTotalPages
  } = useUserList({ page: userPage, pageSize: userPageSize });

  const toggleUser = (id: string) =>
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectPageAll = () =>
    setSelectedUserIds((prev) => {
      const merged = [...prev];
      for (const u of users) {
        if (!merged.includes(u.id)) merged.push(u.id);
      }
      return merged;
    });

  const deselectAll = () => setSelectedUserIds([]);

  const handlePageSizeChange = (size: number) => {
    setUserPageSize(size);
    setUserPage(1);
  };

  return (
    <PageContainer scrollable={true}>
      <div className='w-full overflow-auto'>
        {/* Header */}
        <div className='mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-foreground text-2xl font-bold text-balance md:text-3xl'>
              Coupon Distribution
            </h1>
            <p className='text-muted-foreground mt-1 text-sm'>
              Manage and distribute coupons to your customers
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
          </div>
        </div>

        {/* Content  */}
        <div className='space-y-6'>
          {/* Section 1: Select Coupon */}
          <Card>
            <CardHeader>
              <CardTitle>Select Coupon</CardTitle>
              <CardDescription>
                Choose which coupon you want to distribute
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='coupon-select'>Active Coupon</Label>
                <Select
                  value={
                    selectedCoupon ? selectedCoupon.id.toString() : undefined
                  }
                  onValueChange={(value) => {
                    const coupon = activeCoupons.find(
                      (c) => c.id.toString() === value
                    );
                    setSelectedCoupon(coupon || undefined);
                  }}
                >
                  <SelectTrigger id='coupon-select'>
                    <SelectValue placeholder='Select a coupon...' />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCoupons.map((coupon) => (
                      <SelectItem key={coupon.id} value={coupon.id.toString()}>
                        {coupon.code} - ({coupon.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCoupon && (
                <div className='border-border bg-muted/20 rounded-lg border p-4'>
                  <h3 className='text-foreground mb-3 text-sm font-semibold'>
                    Coupon Summary
                  </h3>
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                    <div className='flex items-center gap-2'>
                      <Tag className='text-muted-foreground h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>Name</p>
                        <p className='text-foreground text-sm font-medium'>
                          {selectedCoupon.description}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>Code</p>
                        <p className='text-foreground font-mono text-sm font-medium'>
                          {selectedCoupon.code}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>Type</p>
                        <Badge variant='outline' className='text-xs'>
                          {selectedCoupon.type}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          Remaining
                        </p>
                        <p className='text-foreground text-sm font-medium'>
                          {/* {selectedCoupon.remaining.toLocaleString()} */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCoupon &&
                (selectedCoupon.usageLimit ?? Number.POSITIVE_INFINITY) <
                  100 && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      Warning: This coupon has limited quantity remaining (
                      {typeof selectedCoupon.usageLimit === 'number'
                        ? selectedCoupon.usageLimit
                        : 'N/A'}{' '}
                      left)
                    </AlertDescription>
                  </Alert>
                )}
            </CardContent>
          </Card>

          {/* Section 2: Distribution Method */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Method</CardTitle>
              <CardDescription>
                Choose how you want to distribute this coupon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={distributionType}
                onValueChange={setDistributionType}
              >
                <div className='space-y-3'>
                  <div className='border-border hover:bg-muted/20 flex items-start space-x-3 rounded-lg border p-4 transition-colors'>
                    <RadioGroupItem
                      value='automatic'
                      id='automatic'
                      className='mt-0.5'
                    />
                    <div className='flex-1'>
                      <Label htmlFor='automatic' className='text-base'>
                        Automatic Distribution
                      </Label>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        Automatically issue coupons based on trigger events like
                        user registration or first order
                      </p>
                    </div>
                  </div>

                  <div className='border-border hover:bg-muted/20 flex items-start space-x-3 rounded-lg border p-4 transition-colors'>
                    <RadioGroupItem
                      value='manual'
                      id='manual'
                      className='mt-0.5'
                    />
                    <div className='flex-1'>
                      <Label htmlFor='manual' className='text-base'>
                        Manual Distribution
                      </Label>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        Manually select specific users to receive this coupon
                      </p>
                    </div>
                  </div>

                  <div className='border-border hover:bg-muted/20 flex items-start space-x-3 rounded-lg border p-4 transition-colors'>
                    <RadioGroupItem
                      value='campaign'
                      id='campaign'
                      className='mt-0.5'
                    />
                    <div className='flex-1'>
                      <Label htmlFor='campaign' className='text-base'>
                        Campaign-based Distribution
                      </Label>
                      <p className='text-muted-foreground mt-1 text-sm'>
                        Create a time-limited campaign with specific
                        distribution rules
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Section 3: Distribution Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution Configuration</CardTitle>
              <CardDescription>
                {distributionType === 'automatic'
                  ? 'Set up automatic distribution rules'
                  : distributionType === 'manual'
                    ? 'Select users to receive the coupon'
                    : 'Configure campaign settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {distributionType === 'automatic' && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='trigger-event'>Trigger Event</Label>
                    <Select>
                      <SelectTrigger id='trigger-event'>
                        <SelectValue placeholder='Select trigger...' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='registration'>
                          User Registration
                        </SelectItem>
                        <SelectItem value='first-order'>First Order</SelectItem>
                        <SelectItem value='birthday'>User Birthday</SelectItem>
                        <SelectItem value='milestone'>
                          Purchase Milestone
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='delay-time'>Delay Time (Optional)</Label>
                    <div className='flex gap-2'>
                      <Input
                        id='delay-time'
                        type='number'
                        placeholder='0'
                        className='flex-1'
                      />
                      <Select defaultValue='hours'>
                        <SelectTrigger className='w-32'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='minutes'>Minutes</SelectItem>
                          <SelectItem value='hours'>Hours</SelectItem>
                          <SelectItem value='days'>Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {distributionType === 'manual' && (
                <div className='space-y-4'>
                  <CouponDistributionUserList
                    users={users}
                    selectedUserIds={selectedUserIds}
                    isLoading={isLoadingUsers}
                    page={userPage}
                    pageSize={userPageSize}
                    total={userTotal}
                    totalPages={userTotalPages}
                    onToggleUser={toggleUser}
                    onSelectPageAll={selectPageAll}
                    onDeselectPageAll={deselectAll}
                    onPageChange={setUserPage}
                    onPageSizeChange={handlePageSizeChange}
                  />
                  <div className='space-y-2'>
                    <Label htmlFor='quantity-per-user'>
                      Issue Quantity Per User
                    </Label>
                    <Input
                      id='quantity-per-user'
                      type='number'
                      defaultValue='1'
                    />
                  </div>
                </div>
              )}

              {distributionType === 'campaign' && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='campaign-name'>Campaign Name</Label>
                    <Input
                      id='campaign-name'
                      placeholder='e.g., Summer Launch Campaign'
                    />
                  </div>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='campaign-start'>Start Date</Label>
                      <Input id='campaign-start' type='date' />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='campaign-end'>End Date</Label>
                      <Input id='campaign-end' type='date' />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='max-distribution'>
                      Maximum Distribution Count
                    </Label>
                    <Input
                      id='max-distribution'
                      type='number'
                      placeholder='e.g., 1000'
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end'>
            <Link href='/' className='w-full sm:w-auto'>
              <Button
                variant='outline'
                className='w-full bg-transparent sm:w-auto'
              >
                Cancel
              </Button>
            </Link>
            <Button variant='secondary' className='w-full sm:w-auto'>
              <Calendar className='mr-2 h-4 w-4' />
              Preview Impact
            </Button>
            <Button disabled={false} className='w-full sm:w-auto'>
              Confirm Distribution
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CouponDistributionView;
