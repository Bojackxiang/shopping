'use client';

import * as React from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import { Label, Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip
} from '@/components/ui/chart';
import useOverView from '../hook/use-overview';

const chartConfig = {
  value: {
    label: 'Orders'
  },
  pending: {
    label: 'Pending',
    color: 'var(--primary)'
  },
  shipped: {
    label: 'Shipped',
    color: 'var(--primary-light)'
  },
  delivered: {
    label: 'Delivered',
    color: 'var(--primary-medium)'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'var(--chart-4)'
  }
} satisfies ChartConfig;

export function PieGraph() {
  const { orderStatusData, orderStatusTotal, isLoading } = useOverView();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取主要状态（订单数最多的）
  const dominantStatus = React.useMemo(() => {
    if (!orderStatusData || orderStatusData.length === 0) {
      return null;
    }
    return orderStatusData.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );
  }, [orderStatusData]);

  if (!isClient || isLoading) {
    return null;
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Order breakdown by status
          </span>
          <span className='@[540px]/card:hidden'>Order status</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              <linearGradient id='fillpending' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary-lighter)'
                  stopOpacity={0.9}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary-lighter)'
                  stopOpacity={0.6}
                />
              </linearGradient>
              <linearGradient id='fillshipped' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary-light)'
                  stopOpacity={0.9}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary-light)'
                  stopOpacity={0.6}
                />
              </linearGradient>
              <linearGradient id='filldelivered' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary)'
                  stopOpacity={0.9}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary)'
                  stopOpacity={0.6}
                />
              </linearGradient>
              <linearGradient id='fillcancelled' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--primary-darker)'
                  stopOpacity={0.9}
                />
                <stop
                  offset='95%'
                  stopColor='var(--primary-darker)'
                  stopOpacity={0.6}
                />
              </linearGradient>
            </defs>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) {
                  return null;
                }
                const data = payload[0];
                const statusLabel = data.name || data.payload.label;
                const orderCount = data.value;
                const percentage = data.payload.percentage || 0;

                return (
                  <div className='bg-background rounded-lg border p-2 shadow-sm'>
                    <div className='flex flex-col gap-1.5'>
                      <div className='text-sm font-semibold'>{statusLabel}</div>
                      <div className='flex items-center gap-2 text-sm'>
                        <span className='font-medium'>{orderCount} orders</span>
                        <span className='text-muted-foreground'>
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={orderStatusData}
              dataKey='value'
              nameKey='label'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              {orderStatusData?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#fill${entry.status})`}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {orderStatusTotal.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Orders
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        {dominantStatus && (
          <div className='flex items-center gap-2 leading-none font-medium'>
            {dominantStatus.label} leads with {dominantStatus.percentage}%
            <IconTrendingUp className='h-4 w-4' />
          </div>
        )}
        <div className='text-muted-foreground leading-none'>
          Current order status overview
        </div>
      </CardFooter>
    </Card>
  );
}
