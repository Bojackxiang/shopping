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
    newCustomers,
    newCustomersGrowthRate,
    isLoading,
    newCustomersLastMonth
  } = useOverView();

  if (isLoading) {
    return <StatSkeleton />;
  }

  const compareToLastMonth = newCustomersGrowthRate >= 0 ? 'up' : 'down';

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardDescription>New Customers</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {newCustomers.toLocaleString()}
          <div className='text-sm'>
            Last Month: {newCustomersLastMonth.toLocaleString()}
          </div>
        </CardTitle>
        <CardAction>
          <Badge variant='outline'>
            {compareToLastMonth === 'down' && <IconTrendingDown />}
            {compareToLastMonth === 'up' && <IconTrendingUp />}
            {Math.abs(newCustomersGrowthRate)}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          {compareToLastMonth === 'down' ? 'Down' : 'Up'} this period{' '}
          {compareToLastMonth === 'down' && (
            <IconTrendingDown className='size-4' />
          )}
          {compareToLastMonth === 'up' && <IconTrendingUp className='size-4' />}
        </div>
        <div className='text-muted-foreground'>Acquisition needs attention</div>
      </CardFooter>
    </Card>
  );
};

export default Page;
