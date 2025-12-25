'use client';

import type React from 'react';

import { useState, useEffect, use } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { HelpCircle, Loader } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQueryState } from 'nuqs';
import { useCouponById } from '../hook/use-coupon-by-id';

interface CreateCouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: FormData) => void;
  onUpdate?: (id: string, data: FormData) => void;
}

export type FormData = {
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function CreateCouponModal({
  open,
  onOpenChange,
  onCreate,
  onUpdate
}: CreateCouponModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset
  } = useForm<FormData>({
    defaultValues: {
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minPurchase: undefined,
      maxDiscount: undefined,
      usageLimit: 10,
      usageLimitPerCustomer: 1,
      startDate: '',
      endDate: '',
      isActive: true
    }
  });

  const [couponId] = useQueryState('couponId');
  const [editorMode] = useQueryState('mode');
  const [Loading, setLoading] = useState<boolean>(false);

  const isEditMode = editorMode === 'edit' && !!couponId;

  const { coupon, isLoading: isLoadingCoupon } = useCouponById(
    isEditMode ? couponId : null
  );

  // if mode == edit and coupon is loaded, populate form
  // if mode == create, reset to default values
  useEffect(() => {
    if (isEditMode && coupon) {
      reset({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase ?? undefined,
        maxDiscount: coupon.maxDiscount ?? undefined,
        usageLimit: coupon.usageLimit ?? 10,
        usageLimitPerCustomer: coupon.usageLimitPerCustomer ?? 1,
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().slice(0, 16)
          : '',
        endDate: coupon.endDate
          ? new Date(coupon.endDate).toISOString().slice(0, 16)
          : '',
        isActive: coupon.isActive
      });
    } else if (!isEditMode && open) {
      reset({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: 0,
        minPurchase: undefined,
        maxDiscount: undefined,
        usageLimit: 10,
        usageLimitPerCustomer: 1,
        startDate: '',
        endDate: '',
        isActive: true
      });
    }
  }, [isEditMode, coupon, open, reset]);

  const watchedValues = watch();
  const { type } = watchedValues;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    if (isEditMode && couponId && onUpdate) {
      await onUpdate(couponId, data);
    } else {
      await onCreate(data);
    }
    setLoading(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] w-[calc(100%-2rem)] max-w-6xl'>
        <DialogHeader>
          <DialogTitle className='text-lg sm:text-xl'>
            {isEditMode ? 'Edit Coupon' : 'Create Coupon'}
          </DialogTitle>
          <DialogDescription className='text-sm'>
            {isEditMode
              ? 'Update coupon rules and usage conditions'
              : 'Configure coupon rules and usage conditions'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingCoupon ? (
          <div className='flex h-[400px] items-center justify-center'>
            <p className='text-muted-foreground'>Loading coupon data...</p>
          </div>
        ) : (
          <ScrollArea className='max-h-[calc(90vh-140px)] pr-4'>
            <TooltipProvider>
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Section 1: Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base sm:text-lg'>
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Set up the fundamental details of your coupon
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <Label htmlFor='code'>Coupon Code</Label>
                      </div>
                      <Input
                        id='code'
                        {...register('code', {
                          required: true
                        })}
                        placeholder='e.g., SUMMER2024'
                        className='font-mono uppercase'
                      />
                      {errors.code && (
                        <p className='text-sm text-red-500'>
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='description'>Description</Label>
                      <Textarea
                        id='description'
                        {...register('description')}
                        placeholder='Describe what this coupon is for...'
                        rows={3}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Validity Period</Label>
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='start-date'
                            className='text-muted-foreground text-sm'
                          >
                            Start Date
                          </Label>
                          <Input
                            id='start-date'
                            type='datetime-local'
                            {...register('startDate', {
                              required: 'Start date is required'
                            })}
                          />
                          {errors.startDate && (
                            <p className='text-sm text-red-500'>
                              {errors.startDate.message}
                            </p>
                          )}
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='end-date'
                            className='text-muted-foreground text-sm'
                          >
                            End Date
                          </Label>
                          <Input
                            id='end-date'
                            type='datetime-local'
                            {...register('endDate', {
                              required: 'End date is required'
                            })}
                          />
                          {errors.endDate && (
                            <p className='text-sm text-red-500'>
                              {errors.endDate.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='border-border bg-muted/20 flex items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='is-active' className='text-base'>
                          Active Status
                        </Label>
                        <p className='text-muted-foreground text-sm'>
                          Activate this coupon immediately
                        </p>
                      </div>
                      <Controller
                        name='isActive'
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id='is-active'
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2: Discount Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base sm:text-lg'>
                      Discount Rules
                    </CardTitle>
                    <CardDescription>
                      Define how the discount will be calculated
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-3'>
                      <Label>Coupon Type</Label>
                      <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem
                                value='FIXED_AMOUNT'
                                id='fixed-amount'
                              />
                              <Label
                                htmlFor='fixed-amount'
                                className='font-normal'
                              >
                                Fixed Amount
                              </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem
                                value='PERCENTAGE'
                                id='percentage'
                              />
                              <Label
                                htmlFor='percentage'
                                className='font-normal'
                              >
                                Percentage
                              </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <RadioGroupItem
                                value='FREE_SHIPPING'
                                id='free-shipping'
                              />
                              <Label
                                htmlFor='free-shipping'
                                className='font-normal'
                              >
                                Free Shipping
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>

                    {type !== 'FREE_SHIPPING' && (
                      <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                          <Label htmlFor='value'>
                            {type === 'PERCENTAGE'
                              ? 'Discount Percentage'
                              : 'Discount Amount'}
                          </Label>
                          <div className='relative'>
                            <Input
                              id='value'
                              type='number'
                              step='0.01'
                              {...register('value', {
                                required: 'Discount value is required',
                                min: {
                                  value: 0,
                                  message: 'Value must be positive'
                                }
                              })}
                              placeholder={
                                type === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 50'
                              }
                              className='pr-8'
                            />
                            <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2'>
                              {type === 'PERCENTAGE' ? '%' : '$'}
                            </span>
                          </div>
                          {errors.value && (
                            <p className='text-sm text-red-500'>
                              {errors.value.message}
                            </p>
                          )}
                        </div>

                        {type === 'PERCENTAGE' && (
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Label htmlFor='max-discount'>
                                Maximum Discount
                              </Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className='text-muted-foreground h-4 w-4' />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className='max-w-xs text-xs'>
                                    Set a cap on the total discount amount when
                                    using percentage-based discounts
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className='relative'>
                              <Input
                                id='max-discount'
                                type='number'
                                step='0.01'
                                {...register('maxDiscount', {
                                  min: {
                                    value: 0,
                                    message: 'Value must be positive'
                                  }
                                })}
                                placeholder='e.g., 100'
                                className='pr-8'
                              />
                              <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2'>
                                $
                              </span>
                            </div>
                            {errors.maxDiscount && (
                              <p className='text-sm text-red-500'>
                                {errors.maxDiscount.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className='space-y-2'>
                      <Label htmlFor='min-purchase'>
                        Minimum Purchase Amount
                      </Label>
                      <div className='relative'>
                        <Input
                          id='min-purchase'
                          type='number'
                          step='0.01'
                          {...register('minPurchase', {
                            min: { value: 0, message: 'Value must be positive' }
                          })}
                          placeholder='e.g., 50 (Optional)'
                          className='pr-8'
                        />
                        <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2'>
                          $
                        </span>
                      </div>
                      {errors.minPurchase && (
                        <p className='text-sm text-red-500'>
                          {errors.minPurchase.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3: Usage Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base sm:text-lg'>
                      Usage Limits
                    </CardTitle>
                    <CardDescription>
                      Control how many times this coupon can be used
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='usage-limit'>Total Usage Limit</Label>
                        <Input
                          id='usage-limit'
                          type='number'
                          {...register('usageLimit', {
                            min: {
                              value: 1,
                              message: 'Value must be at least 1'
                            }
                          })}
                          placeholder='e.g., 1000 (Optional)'
                        />
                        {errors.usageLimit && (
                          <p className='text-sm text-red-500'>
                            {errors.usageLimit.message}
                          </p>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='usage-limit-per-customer'>
                          Per Customer Usage Limit
                        </Label>
                        <Input
                          id='usage-limit-per-customer'
                          type='number'
                          {...register('usageLimitPerCustomer', {
                            min: {
                              value: 1,
                              message: 'Value must be at least 1'
                            }
                          })}
                          placeholder='e.g., 1 (Optional)'
                        />
                        {errors.usageLimitPerCustomer && (
                          <p className='text-sm text-red-500'>
                            {errors.usageLimitPerCustomer.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className='border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end'>
                  <Button
                    disabled={Loading}
                    type='button'
                    variant='outline'
                    onClick={() => {
                      reset();
                      onOpenChange(false);
                    }}
                    className='w-full sm:w-auto'
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={Loading}
                    type='button'
                    variant='secondary'
                    onClick={handleSubmit((data) => {
                      onCreate({ ...data, isActive: false });
                      reset();
                      onOpenChange(false);
                    })}
                    className='w-full sm:w-auto'
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type='submit'
                    className='w-full sm:w-auto'
                    disabled={Loading}
                  >
                    {Loading && <Loader className='animate spin' />}
                    {isEditMode ? 'Update Coupon' : 'Create Coupon'}
                  </Button>
                </div>
              </form>
            </TooltipProvider>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
