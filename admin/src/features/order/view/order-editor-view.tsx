'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { SerializedOrder } from '@/repositories/order/order.type';
import { ArrowLeft, Ban, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { OrderStatusBadge } from '../component/order-status-badge';
import { PaymentStatusBadge } from '../component/payment-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateOrder } from '../hook/use-update-order';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { useGlobalLoading } from '@/hooks/use-global-loading';
import { delay } from '@/utils/delay';

interface OrderEditorViewProps {
  order: SerializedOrder;
}

type OrderFormData = {
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingCost: string;
  trackingNumber: string;
  adminNote: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
};

const OrderEditorView = ({ order }: OrderEditorViewProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty }
  } = useForm<OrderFormData>({
    defaultValues: {
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || '',
      shippingCost: order.shippingCost.toString(),
      trackingNumber: order.trackingNumber || '',
      adminNote: order.adminNote || '',
      shippingFullName: order.shippingFullName,
      shippingPhone: order.shippingPhone,
      shippingAddressLine1: order.shippingAddressLine1,
      shippingAddressLine2: order.shippingAddressLine2 || '',
      shippingCity: order.shippingCity,
      shippingState: order.shippingState || '',
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry
    }
  });

  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const { showLoading, hideLoading } = useGlobalLoading();

  const {
    trigger: updateOrder,
    isLoading: isUpdatingOrder,
    error
  } = useUpdateOrder();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onSubmit = async (data: OrderFormData) => {
    const updatedOrder = {
      id: order.id,
      status: (data.status as OrderStatus) || OrderStatus.UNKNOWN,
      paymentStatus:
        (data.paymentStatus as PaymentStatus) || PaymentStatus.UNKNOWN,
      paymentMethod: data.paymentMethod || undefined,
      shippingCost: parseFloat(data.shippingCost) || 0,
      trackingNumber: data.trackingNumber || undefined,
      adminNote: data.adminNote || undefined,
      shippingFullName: data.shippingFullName || '',
      shippingPhone: data.shippingPhone || '',
      shippingAddressLine1: data.shippingAddressLine1 || '',
      shippingAddressLine2: data.shippingAddressLine2 || '',
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry
    };

    try {
      showLoading('Updating order...');
      await delay(3000);
      await updateOrder(updatedOrder);
    } finally {
      hideLoading();
    }
  };

  const handleCancel = async () => {
    console.log('Cancelling order with reason:', cancelReason);
    setCancelDialog(false);
    setCancelReason('');

    try {
      showLoading('Cancelling order...');
      await updateOrder({
        id: order.id,
        status: OrderStatus.CANCELLED,
        cancelReason: cancelReason
      });
    } finally {
      hideLoading();
    }
  };

  return (
    <PageContainer scrollable>
      <div className='bg-background min-h-screen w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' asChild>
              <Link href={`/dashboard/order/${order.id}`}>
                <ArrowLeft className='h-5 w-5' />
              </Link>
            </Button>
            <div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                Edit Order
              </h1>
              <div className='mt-1 flex items-center gap-3'>
                <span className='text-muted-foreground font-mono text-sm'>
                  {order.orderNumber}
                </span>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Order & Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='order-status'>Order Status</Label>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='order-status'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='PENDING'>Pending</SelectItem>
                        <SelectItem value='PROCESSING'>Processing</SelectItem>
                        <SelectItem value='SHIPPED'>Shipped</SelectItem>
                        <SelectItem value='DELIVERED'>Delivered</SelectItem>
                        <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                        <SelectItem value='REFUNDED'>Refunded</SelectItem>
                        <SelectItem value='UNKNOWN'>Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='payment-status'>Payment Status</Label>
                <Controller
                  name='paymentStatus'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='payment-status'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='PENDING'>Pending</SelectItem>
                        <SelectItem value='PAID'>Paid</SelectItem>
                        <SelectItem value='FAILED'>Failed</SelectItem>
                        <SelectItem value='REFUNDED'>Refunded</SelectItem>
                        <SelectItem value='UNKNOWN'>Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='payment-method'>Payment Method</Label>
                <Input
                  id='payment-method'
                  {...register('paymentMethod')}
                  placeholder='Credit Card, PayPal, etc.'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='shipping-cost'>Shipping Cost</Label>
                <Input
                  id='shipping-cost'
                  type='number'
                  step='0.01'
                  min='0'
                  {...register('shippingCost')}
                />
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='tracking-number'>Tracking Number</Label>
                <Input
                  id='tracking-number'
                  {...register('trackingNumber')}
                  placeholder='TRK-1234567890'
                />
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='admin-note'>Admin Note</Label>
                <Textarea
                  id='admin-note'
                  {...register('adminNote')}
                  placeholder='Add internal notes about this order...'
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='shipping-full-name'>Full Name</Label>
                <Input
                  id='shipping-full-name'
                  {...register('shippingFullName', { required: true })}
                  placeholder='张三'
                />
                {errors.shippingFullName && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='shipping-phone'>Phone</Label>
                <Input
                  id='shipping-phone'
                  {...register('shippingPhone', { required: true })}
                  placeholder='13800138000'
                />
                {errors.shippingPhone && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='shipping-address-line1'>Address Line 1</Label>
                <Input
                  id='shipping-address-line1'
                  {...register('shippingAddressLine1', { required: true })}
                  placeholder='朝阳区建国路88号SOHO现代城'
                />
                {errors.shippingAddressLine1 && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='shipping-address-line2'>
                  Address Line 2 (Optional)
                </Label>
                <Input
                  id='shipping-address-line2'
                  {...register('shippingAddressLine2')}
                  placeholder='A座1001室'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='shipping-city'>City</Label>
                <Input
                  id='shipping-city'
                  {...register('shippingCity', { required: true })}
                  placeholder='北京'
                />
                {errors.shippingCity && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='shipping-state'>State/Province</Label>
                <Input
                  id='shipping-state'
                  {...register('shippingState', { required: true })}
                  placeholder='北京市'
                />
                {errors.shippingState && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='shipping-postal-code'>Postal Code</Label>
                <Input
                  id='shipping-postal-code'
                  {...register('shippingPostalCode', { required: true })}
                  placeholder='100020'
                />
                {errors.shippingPostalCode && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='shipping-country'>Country</Label>
                <Input
                  id='shipping-country'
                  {...register('shippingCountry', { required: true })}
                  placeholder='China'
                />
                {errors.shippingCountry && (
                  <p className='text-destructive text-sm'>
                    This field is required
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Read-Only Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details (Read-Only)</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <Label className='text-muted-foreground'>Order Number</Label>
                <p className='mt-1 font-mono text-sm'>{order.orderNumber}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Customer</Label>
                <p className='mt-1 text-sm font-medium'>
                  {order.customers?.firstName} {order.customers?.lastName}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {order.customers?.email}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Coupon Code</Label>
                <p className='mt-1 text-sm'>
                  {order.coupons?.code ? (
                    <code className='bg-accent rounded px-2 py-1 font-mono text-xs'>
                      {order.coupons.code}
                    </code>
                  ) : (
                    <span className='text-muted-foreground'>None</span>
                  )}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Created At</Label>
                <p className='mt-1 text-sm'>{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <Label className='text-muted-foreground mb-3 block'>
                Order Items
              </Label>
              <div className='border-border overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[60px]'>Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className='text-right'>Qty</TableHead>
                      <TableHead className='text-right'>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className='border-border bg-accent relative h-12 w-12 overflow-hidden rounded border'>
                            <Image
                              src={item.productImage || '/placeholder.svg'}
                              alt={item.productName}
                              fill
                              className='object-cover'
                              sizes='48px'
                            />
                          </div>
                        </TableCell>
                        <TableCell className='font-medium'>
                          {item.productName}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {item.variantName}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {item.quantity}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {formatCurrency(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between'>
          <div className='flex gap-3'>
            <Button variant='outline' onClick={() => setCancelDialog(true)}>
              <Ban className='mr-2 h-4 w-4' />
              Cancel Order
            </Button>
          </div>
          <div className='flex gap-3'>
            <Button variant='outline' asChild>
              <Link href={`/dashboard/order/${order.id}`}>Cancel</Link>
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty}>
              <Save className='mr-2 h-4 w-4' />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Cancel Order Dialog */}
        <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for cancelling this order. The customer
                will be notified and a refund will be processed if payment was
                received.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className='my-4'>
              <Label htmlFor='cancel-reason'>Cancellation Reason</Label>
              <Textarea
                id='cancel-reason'
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder='e.g., Out of stock, Customer request, etc.'
                rows={3}
                className='mt-2'
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelReason('')}>
                Go Back
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className='bg-warning text-warning-foreground hover:bg-warning/90'
              >
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
};

export default OrderEditorView;
