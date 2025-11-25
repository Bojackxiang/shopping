'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Loader2, Router } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { onToast, onToastError } from '@/lib/toast';
import { useConfirmDialog } from '@/components/confirm-dialog-provider';
import { useCategoryContext } from '../context/category-context';

interface CategoryDetailProps {
  category: any;
  onUpdate: () => void;
}

export default function CategoryDetail({
  category,
  onUpdate
}: CategoryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { handleUpdateCategory, handleDeleteCategory } = useCategoryContext();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || ''
  });

  useEffect(() => {
    setFormData({
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || ''
    });
    setIsEditing(false);
  }, [category?.id]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await handleUpdateCategory(category.id, formData);
      onToast('Category updated successfully');
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      onToastError(
        error instanceof Error ? error.message : 'Error updating category'
      );
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDelete = async () => {
    await confirm(
      async () => {
        try {
          await handleDeleteCategory(category.id);
          onToast('Category deleted successfully');
          onUpdate();
        } catch (error) {
          onToastError(
            error instanceof Error ? error.message : 'Error deleting category'
          );
        }
      },
      {
        title: 'Delete Category',
        description: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive'
      }
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-foreground text-lg font-semibold'>
          {isEditing ? 'Edit Category' : category.name}
        </h2>
        {!isEditing && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditing(true)}
              className='gap-2'
            >
              <Edit2 className='h-4 w-4' />
              Edit
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleDelete}
              className='text-destructive hover:bg-destructive/10 gap-2'
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className='border-border bg-card h-full flex-1 space-y-6 rounded-lg border p-6'>
        {isEditing ? (
          <div className='space-y-4'>
            <div>
              <label className='text-foreground text-sm font-medium'>
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='mt-1'
              />
            </div>
            <div>
              <label className='text-foreground text-sm font-medium'>
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className='mt-1'
              />
            </div>
            <div>
              <label className='text-foreground text-sm font-medium'>
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='border-input bg-background text-foreground mt-1 w-full rounded-md border p-2 text-sm'
                rows={4}
              />
            </div>
            <div className='flex gap-2 pt-4'>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button variant='outline' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Name
              </p>
              <p className='text-foreground mt-1'>{category.name}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Slug
              </p>
              <p className='text-foreground mt-1 font-mono text-sm'>
                {category.slug}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Description
              </p>
              <p className='text-foreground mt-1'>
                {category.description || 'No description'}
              </p>
            </div>
            <div className='grid grid-cols-1'>
              <div>
                <p className='text-muted-foreground text-xs font-medium uppercase'>
                  Last Updated
                </p>
                <p className='text-foreground mt-1'>
                  {new Date(category.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
