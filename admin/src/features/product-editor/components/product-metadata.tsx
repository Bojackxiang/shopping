'use client';

// React & Third-party
import { useState } from 'react';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Icons
import { ChevronRight, X } from 'lucide-react';

// Business Logic & Hooks
import { useProductForm } from '../context/product-form-context';
import useCategoryData from '../hooks/use-category-data';
import useTagsData from '../hooks/use-tags-data';
import { CategorySelection } from './categoey-selection';
import { TagSelection } from './tag-selection';
import { updateProductCategories } from '@/repositories/product-category/product-category-repo';
import { onToast, onToastError } from '@/lib/toast';

interface ProductMetadataProps {
  productId: string;
}

export default function ProductMetadata({ productId }: ProductMetadataProps) {
  // ====== Form Context ======
  const { form } = useProductForm();
  const { register, setValue, watch } = form;

  // ====== State ======
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [tagDialogOpen, setTagDialogOpen] = useState<boolean>(false);

  // ====== Category Data ======
  const {
    selectedCategories,
    availableCategories,
    availableCategoriesTree,
    refetch
  } = useCategoryData({ productId });

  // ====== Tag Data ======
  const { availableTags } = useTagsData();

  // ====== Watched Form Values ======
  const tagIds: string[] = watch('tagIds') || [];
  const isFeatured = watch('isFeatured');
  const isNew = watch('isNew');

  // ====== Handlers ======
  // Remove tag
  const handleRemoveTag = (id: string) => {
    setValue(
      'tagIds',
      tagIds.filter((t: string) => t !== id),
      { shouldDirty: true }
    );
  };

  // Confirm tag selection
  const onTagConfirm = (ids: string[]) => {
    setValue('tagIds', ids, { shouldDirty: true });
  };

  // Confirm category selection
  const onConfirmHandler = async (
    productId: string,
    selectedCategories: Array<{ id: string }>
  ) => {
    try {
      const selectedCategoriesIds = selectedCategories.map((cate) => cate.id);
      await updateProductCategories(productId, selectedCategoriesIds);
      await refetch();
      onToast('Category updated successfully');
    } catch (error) {
      onToastError('Failed to update category');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>Categories and tags</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Categories */}{' '}
        <div className='space-y-2'>
          <Label htmlFor='categoryId' className='text-sm font-medium'>
            Category
          </Label>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-between bg-transparent'
            onClick={() => setDialogOpen(true)}
          >
            <span
              className={
                selectedCategories.length > 0
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            >
              {selectedCategories.length > 0
                ? `${selectedCategories.length} category(ies) selected`
                : 'Select categories...'}
            </span>
            <ChevronRight size={18} />
          </Button>
          <CategorySelection
            productId={productId}
            open={dialogOpen}
            onOpenChange={() => setDialogOpen(!dialogOpen)}
            categories={availableCategories}
            selectedCategories={selectedCategories}
            categoriesTree={availableCategoriesTree}
            onConfirmHandler={onConfirmHandler}
          />
        </div>
        {/* Tags */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Tags</Label>
          <Button
            type='button'
            variant='outline'
            className='w-full justify-between bg-transparent'
            onClick={() => setTagDialogOpen(true)}
          >
            <span
              className={
                tagIds.length > 0
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }
            >
              {tagIds.length > 0
                ? `${tagIds.length} tag(s) selected`
                : 'Select tags...'}
            </span>
            <ChevronRight size={18} />
          </Button>
          {tagIds.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-1'>
              {tagIds.map((id: string) => {
                const tag = availableTags.find((t) => t.id === id);
                return (
                  <Badge key={id} variant='outline' className='gap-2 pl-2'>
                    <span
                      className='inline-block h-2 w-2 flex-shrink-0 rounded-full border'
                      style={{
                        backgroundColor: tag?.color || 'transparent'
                      }}
                      aria-hidden
                    />
                    {tag?.name ?? id}
                    <button
                      type='button'
                      onClick={() => handleRemoveTag(id)}
                      className='hover:text-destructive'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
          <TagSelection
            open={tagDialogOpen}
            onOpenChange={setTagDialogOpen}
            availableTags={availableTags}
            selectedTagIds={tagIds}
            onConfirm={onTagConfirm}
          />
        </div>
        {/* Flags */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Product Flags</Label>
          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='isFeatured'
                checked={isFeatured}
                onCheckedChange={(checked) =>
                  setValue('isFeatured', !!checked, { shouldDirty: true })
                }
              />
              <label
                htmlFor='isFeatured'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Featured Product
              </label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='isNew'
                checked={isNew}
                onCheckedChange={(checked) =>
                  setValue('isNew', !!checked, { shouldDirty: true })
                }
              />
              <label
                htmlFor='isNew'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                New Arrival
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
