'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { onToast, onToastError } from '@/lib/toast';
import { useCategoryStore } from '../lib/store';
import { useCategoryContext } from '../context/category-context';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
}

export default function AddCategoryDialog({
  open,
  onOpenChange,
  parentId
}: AddCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleAddCategory } = useCategoryContext();

  const handleAdd = async () => {
    if (!formData.name || !formData.slug) {
      onToastError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await handleAddCategory({
        ...formData,
        parentId: parentId ?? null
      });

      onToast('Category added successfully');
      setFormData({ name: '', slug: '', description: '' });
      onOpenChange(false);
    } catch (error: any) {
      onToastError('Failed to add category', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            {parentId
              ? 'Create a subcategory'
              : 'Create a new product category'}{' '}
            for your e-commerce store
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='text-foreground text-sm font-medium'>
              Name *
            </label>
            <Input
              placeholder='e.g., Smart Devices'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='mt-1'
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className='text-foreground text-sm font-medium'>
              Slug *
            </label>
            <Input
              placeholder='e.g., smart-devices'
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className='mt-1'
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className='text-foreground text-sm font-medium'>
              Description
            </label>
            <textarea
              placeholder='Optional category description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='border-input bg-background text-foreground mt-1 w-full rounded-md border p-2 text-sm disabled:cursor-not-allowed disabled:opacity-50'
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className='mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                Creating...
              </>
            ) : (
              'Create Category'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
