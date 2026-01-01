'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import useOverView from '@/features/overview/hook/use-overview';
import StatSkeleton from '@/features/overview/components/stat-skeleton';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import React from 'react';

const Page = () => {
  const {
    totalRevenue,
    totalRevenueGrowthRate,
    isLoading,
    totalRevenueLastMonth
  } = useOverView();

  if (isLoading) {
    return <StatSkeleton />;
  }

  const compareToLastMonth = totalRevenueGrowthRate >= 0 ? 'up' : 'down';

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {totalRevenue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          })}
          <div className='text-sm'>
            Last Month:
            {totalRevenueLastMonth.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </div>
        </CardTitle>
        <CardAction>
          <Badge variant='outline'>
            <IconTrendingUp />
            {totalRevenueGrowthRate}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          Trending up this month{' '}
          {compareToLastMonth === 'up' && <IconTrendingUp className='size-4' />}
          {compareToLastMonth === 'down' && (
            <IconTrendingDown className='size-4' />
          )}
        </div>
        <div className='text-muted-foreground'>
          Visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default Page;
