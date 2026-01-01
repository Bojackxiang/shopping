import { Card, CardHeader, CardFooter, CardAction } from '@/components/ui/card';
import React from 'react';

const StatSkeleton = () => {
  return (
    <Card className='@container/card'>
      <CardHeader>
        {/* CardDescription skeleton */}
        <div className='bg-muted mb-2 h-4 w-24 animate-pulse rounded-md'></div>

        {/* CardTitle skeleton - 大标题金额 */}
        <div className='bg-muted mb-3 h-8 w-32 animate-pulse rounded-md @[250px]/card:h-9 @[250px]/card:w-40'></div>

        {/* CardAction - Badge skeleton */}
        <CardAction>
          <div className='bg-muted flex h-6 w-20 animate-pulse items-center gap-1 rounded-md'></div>
        </CardAction>
      </CardHeader>

      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        {/* 第一行文字 skeleton */}
        <div className='bg-muted h-4 w-40 animate-pulse rounded-md'></div>

        {/* 第二行次要文字 skeleton */}
        <div className='bg-muted h-3 w-36 animate-pulse rounded-md'></div>
      </CardFooter>
    </Card>
  );
};

export default StatSkeleton;
