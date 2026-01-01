'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useRecentSales } from '../hook/use-recent-sales';
import { RecentSalesSkeleton } from './recent-sales-skeleton';

// 生成用户名首字母缩写
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// 格式化金额
function formatAmount(amount: number): string {
  return `+$${amount.toFixed(2)}`;
}

export function RecentSales() {
  const { sales, isLoading, error } = useRecentSales();

  if (isLoading) {
    return <RecentSalesSkeleton />;
  }

  if (error) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Failed to load recent sales</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        {/* TODO: 计算实际的本月销售数量 */}
        <CardDescription>
          {sales.length > 0
            ? `Showing ${sales.length} recent sales`
            : 'No recent sales'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {sales.map((sale) => {
            // customer 从数据中直接获取
            const customer = sale.customer;

            // 处理 customer 为 null 的情况
            if (!customer) {
              return (
                <div key={sale.id} className='flex items-center'>
                  <Avatar className='h-9 w-9'>
                    <AvatarFallback>??</AvatarFallback>
                  </Avatar>
                  <div className='ml-4 space-y-1'>
                    <p className='text-sm leading-none font-medium'>
                      Unknown Customer
                    </p>
                    <p className='text-muted-foreground text-sm'>-</p>
                  </div>
                  <div className='ml-auto font-medium'>
                    {formatAmount(sale.total)}
                  </div>
                </div>
              );
            }

            return (
              <div key={sale.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  {/* imageUrl 从 customer.imageUrl 获取 */}
                  <AvatarImage src={customer.imageUrl || ''} alt='Avatar' />
                  {/* fallback 从 customer.name 生成首字母 */}
                  <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  {/* name 从 customer.name 获取 */}
                  <p className='text-sm leading-none font-medium'>
                    {customer.name}
                  </p>
                  {/* email 从 customer.email 获取 */}
                  <p className='text-muted-foreground text-sm'>
                    {customer.email}
                  </p>
                </div>
                {/* amount 从 sale.total 格式化后获取 */}
                <div className='ml-auto font-medium'>
                  {formatAmount(sale.total)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
