'use client';

import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ChevronDown, Archive, RotateCcw } from 'lucide-react';
import { useProductForm } from '../context/product-form-context';

export default function ProductVariants() {
  const { form } = useProductForm();
  const { control, register, setValue, watch } = form;

  // Use useFieldArray to manage the variants array
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants'
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Watch all variants to get their current values
  const variants = watch('variants');

  const handleAddVariant = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Create new variant with default values
    append({
      sku: '',
      barcode: null,
      name: null,
      price: 0,
      compareAtPrice: null,
      cost: null,
      inventory: 0,
      lowStockThreshold: 5,
      trackInventory: true,
      size: null,
      color: null,
      material: null,
      weight: null,
      attributes: null,
      isDefault: fields.length === 0, // First variant is default
      sortOrder: fields.length,
      isActive: true
    });

    // Auto-expand the newly created variant
    setTimeout(() => {
      if (fields.length >= 0) {
        setExpandedId(String(fields.length));
      }
    }, 0);
  };

  const handleExpandVariant = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.preventDefault();
    setExpandedId(expandedId === String(index) ? null : String(index));
  };

  const handleDeleteVariant = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.preventDefault();

    const variant = variants?.[index];

    // 如果 variant 有 id（从数据库来的），使用软删除
    if (variant?.id) {
      // 软删除：只设置 isActive = false
      setValue(`variants.${index}.isActive`, false, { shouldDirty: true });

      // 如果删除的是默认 variant，设置第一个在售的为默认
      if (variant.isDefault) {
        const firstActiveIndex = variants.findIndex(
          (v: any, i: number) => i !== index && v?.isActive !== false
        );
        if (firstActiveIndex !== -1) {
          setValue(`variants.${firstActiveIndex}.isDefault`, true, {
            shouldDirty: true
          });
          setValue(`variants.${index}.isDefault`, false, {
            shouldDirty: true
          });
        }
      }
    } else {
      // 如果是新创建的（没有 id），直接从数组中移除
      const wasDefault = variant?.isDefault;
      remove(index);

      if (wasDefault && fields.length > 1) {
        setValue('variants.0.isDefault', true, { shouldDirty: true });
      }
    }
  };

  const handleSetDefault = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.preventDefault();

    // Set all variants to not default, then set the selected one as default
    fields.forEach((_, i) => {
      setValue(`variants.${i}.isDefault`, i === index, { shouldDirty: true });
    });
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Product Variants</CardTitle>
          <CardDescription>
            SKU, pricing, and inventory management
          </CardDescription>
        </div>
        <Button
          type='button'
          onClick={handleAddVariant}
          size='sm'
          className='gap-2'
        >
          <Plus className='h-4 w-4' />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent className='space-y-3'>
        {fields.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <p>No variants yet. Add one to get started.</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {fields.map((field, index) => {
              const variant = variants?.[index];

              return (
                <div key={field.id}>
                  <button
                    type='button'
                    onClick={(e) => handleExpandVariant(e, index)}
                    className={`border-border hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      variant?.isActive === false ? 'bg-muted opacity-60' : ''
                    }`}
                  >
                    <div className='flex flex-1 items-center gap-3'>
                      <ChevronDown
                        className={`text-muted-foreground h-4 w-4 transition-transform ${
                          expandedId === String(index) ? 'rotate-180' : ''
                        }`}
                      />
                      <div>
                        <p className='text-foreground font-medium'>
                          {variant?.name || 'Unnamed Variant'}
                          {variant?.isDefault && (
                            <span className='text-primary ml-2 text-xs'>
                              (Default)
                            </span>
                          )}
                          {variant?.isActive === false && (
                            <span className='ml-2 flex items-center gap-1 text-xs font-semibold text-red-600'>
                              <Archive className='h-3 w-3' />
                              Discontinued
                            </span>
                          )}
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          {variant?.sku || 'No SKU'}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-foreground font-medium'>
                        ${variant?.price?.toFixed(2) || '0.00'}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {variant?.isActive === false
                          ? 'Discontinued'
                          : `${variant?.inventory || 0} in stock`}
                      </p>
                    </div>
                  </button>

                  {expandedId === String(index) && (
                    <div className='bg-muted/50 border-border mt-2 space-y-4 rounded-lg border border-t-0 p-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        {/* Name */}
                        <div>
                          <Label className='text-sm'>Name</Label>
                          <Input
                            {...register(`variants.${index}.name`)}
                            placeholder='e.g., Large - Red'
                            className='mt-1'
                          />
                        </div>

                        {/* SKU */}
                        <div>
                          <Label className='text-sm'>
                            SKU <span className='text-destructive'>*</span>
                          </Label>
                          <Input
                            {...register(`variants.${index}.sku`)}
                            placeholder='e.g., PROD-001'
                            className='mt-1'
                          />
                        </div>

                        {/* Barcode */}
                        <div>
                          <Label className='text-sm'>Barcode</Label>
                          <Input
                            {...register(`variants.${index}.barcode`)}
                            placeholder='e.g., 1234567890123'
                            className='mt-1'
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <Label className='text-sm'>
                            Price <span className='text-destructive'>*</span>
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            {...register(`variants.${index}.price`, {
                              valueAsNumber: true
                            })}
                            placeholder='0.00'
                            className='mt-1'
                          />
                        </div>

                        {/* Compare At Price */}
                        <div>
                          <Label className='text-sm'>Compare At Price</Label>
                          <Input
                            type='number'
                            step='0.01'
                            {...register(`variants.${index}.compareAtPrice`, {
                              valueAsNumber: true
                            })}
                            placeholder='0.00'
                            className='mt-1'
                          />
                        </div>

                        {/* Cost */}
                        <div>
                          <Label className='text-sm'>Cost</Label>
                          <Input
                            type='number'
                            step='0.01'
                            {...register(`variants.${index}.cost`, {
                              valueAsNumber: true
                            })}
                            placeholder='0.00'
                            className='mt-1'
                          />
                        </div>

                        {/* Inventory */}
                        <div>
                          <Label className='text-sm'>Inventory</Label>
                          <Input
                            type='number'
                            {...register(`variants.${index}.inventory`, {
                              valueAsNumber: true
                            })}
                            placeholder='0'
                            className='mt-1'
                          />
                        </div>

                        {/* Low Stock Threshold */}
                        <div>
                          <Label className='text-sm'>Low Stock Threshold</Label>
                          <Input
                            type='number'
                            {...register(
                              `variants.${index}.lowStockThreshold`,
                              {
                                valueAsNumber: true
                              }
                            )}
                            placeholder='5'
                            className='mt-1'
                          />
                        </div>

                        {/* Size */}
                        <div>
                          <Label className='text-sm'>Size</Label>
                          <Input
                            {...register(`variants.${index}.size`)}
                            placeholder='e.g., S, M, L, XL'
                            className='mt-1'
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <Label className='text-sm'>Color</Label>
                          <Input
                            {...register(`variants.${index}.color`)}
                            placeholder='e.g., Red, Blue'
                            className='mt-1'
                          />
                        </div>

                        {/* Material */}
                        <div>
                          <Label className='text-sm'>Material</Label>
                          <Input
                            {...register(`variants.${index}.material`)}
                            placeholder='e.g., 和田玉, 翡翠'
                            className='mt-1'
                          />
                        </div>

                        {/* Weight */}
                        <div>
                          <Label className='text-sm'>Weight (g)</Label>
                          <Input
                            type='number'
                            step='0.01'
                            {...register(`variants.${index}.weight`, {
                              valueAsNumber: true
                            })}
                            placeholder='0.00'
                            className='mt-1'
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex gap-2 pt-2'>
                        {variant?.isActive === false ? (
                          // Discontinued variant shows restore button
                          <>
                            <Button
                              type='button'
                              size='sm'
                              variant='default'
                              onClick={(e) => {
                                e.preventDefault();
                                setValue(`variants.${index}.isActive`, true, {
                                  shouldDirty: true
                                });
                              }}
                              className='gap-2'
                            >
                              <RotateCcw className='h-4 w-4' />
                              Restore
                            </Button>
                            <div className='text-muted-foreground ml-auto flex items-center text-sm'>
                              ⚠️ This variant is discontinued and hidden from
                              customers
                            </div>
                          </>
                        ) : (
                          // 正常销售的 variant 显示常规按钮
                          <>
                            <Button
                              type='button'
                              size='sm'
                              variant={
                                variant?.isDefault ? 'default' : 'outline'
                              }
                              onClick={(e) => handleSetDefault(e, index)}
                            >
                              {variant?.isDefault
                                ? '✓ Default'
                                : 'Set as Default'}
                            </Button>
                            <Button
                              type='button'
                              size='sm'
                              variant='destructive'
                              onClick={(e) => handleDeleteVariant(e, index)}
                              className='ml-auto gap-2'
                              disabled={fields.length === 1}
                            >
                              <Archive className='h-4 w-4' />
                              Discontinue
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
