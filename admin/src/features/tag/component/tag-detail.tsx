'use client';

import { useEffect, useState } from 'react';
import { Edit2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Switch } from '@/components/ui/switch';
import { onToast, onToastError } from '@/lib/toast';
import { useConfirmDialog } from '@/components/confirm-dialog-provider';
import { useTagContext } from '../context/tag-context';

interface TagDetailProps {
  tag: any;
  onUpdate: () => void;
}

export default function TagDetail({ tag, onUpdate }: TagDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { handleUpdateTag, handleSetTagActive } = useTagContext();
  const [formData, setFormData] = useState({
    name: tag?.name || '',
    slug: tag?.slug || '',
    description: tag?.description || '',
    color: tag?.color || '',
    isActive: tag?.isActive ?? true
  });

  useEffect(() => {
    setFormData({
      name: tag?.name || '',
      slug: tag?.slug || '',
      description: tag?.description || '',
      color: tag?.color || '',
      isActive: tag?.isActive ?? true
    });
    setIsEditing(false);
  }, [tag?.id]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await handleUpdateTag(tag.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        color: formData.color || undefined,
        isActive: formData.isActive
      });
      onToast('Tag updated successfully');
      setIsEditing(false);
    } catch (error) {
      onToastError(
        error instanceof Error ? error.message : 'Error updating tag'
      );
    } finally {
      setLoading(false);
    }
  };

  const { confirm } = useConfirmDialog();

  const handleDeactivate = async () => {
    const productCount: number = (tag as any)?._count?.product_tags ?? 0;
    const plural = productCount === 1 ? '' : 's';
    confirm(
      async () => {
        try {
          await handleSetTagActive(tag.id, false);
          onToast('Tag deactivated');
        } catch (error) {
          onToastError(
            error instanceof Error ? error.message : 'Error deactivating tag'
          );
        }
      },
      {
        title: 'Deactivate Tag',
        description:
          productCount > 0 ? (
            <div className='space-y-2'>
              <p>
                This tag is currently used by{' '}
                <span className='text-foreground font-medium'>
                  {productCount} product{plural}
                </span>
                . Deactivating hides it from the storefront; product
                associations are preserved.
              </p>
              <p className='text-muted-foreground text-xs'>
                You can re-activate it later.
              </p>
            </div>
          ) : (
            <p>
              This will hide the tag from the storefront. You can re-activate
              it later.
            </p>
          ),
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        variant: 'destructive'
      }
    );
  };

  const handleActivate = async () => {
    confirm(
      async () => {
        try {
          await handleSetTagActive(tag.id, true);
          onToast('Tag activated');
        } catch (error) {
          onToastError(
            error instanceof Error ? error.message : 'Error activating tag'
          );
        }
      },
      {
        title: 'Activate Tag',
        description: 'Make this tag visible on the storefront again.',
        confirmText: 'Activate',
        cancelText: 'Cancel'
      }
    );
  };

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-foreground text-lg font-semibold'>
          {isEditing ? 'Edit Tag' : tag.name}
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
            {tag.isActive ? (
              <Button
                variant='outline'
                size='sm'
                onClick={handleDeactivate}
                className='text-destructive hover:bg-destructive/10 gap-2'
              >
                <EyeOff className='h-4 w-4' />
                Deactivate
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={handleActivate}
                className='gap-2'
              >
                <Eye className='h-4 w-4' />
                Activate
              </Button>
            )}
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
                Color
              </label>
              <div className='mt-1 flex items-center gap-2'>
                <Input
                  type='color'
                  value={formData.color || '#000000'}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className='h-10 w-16 cursor-pointer p-1'
                />
                <Input
                  value={formData.color}
                  placeholder='#RRGGBB'
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className='flex-1'
                />
              </div>
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
            <div className='flex items-center justify-between rounded-md border p-3'>
              <div>
                <p className='text-foreground text-sm font-medium'>Active</p>
                <p className='text-muted-foreground text-xs'>
                  Inactive tags are hidden from the storefront but kept here
                  for management.
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
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
              <p className='text-foreground mt-1'>{tag.name}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Slug
              </p>
              <p className='text-foreground mt-1 font-mono text-sm'>
                {tag.slug}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Color
              </p>
              <div className='mt-1 flex items-center gap-2'>
                <span
                  className='inline-block h-5 w-5 rounded-full border'
                  style={{ backgroundColor: tag.color || 'transparent' }}
                  aria-hidden
                />
                <span className='text-foreground font-mono text-sm'>
                  {tag.color || '—'}
                </span>
              </div>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Description
              </p>
              <p className='text-foreground mt-1'>
                {tag.description || 'No description'}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Status
              </p>
              <p className='mt-1'>
                {tag.isActive ? (
                  <span className='inline-flex items-center rounded-md bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400'>
                    Active
                  </span>
                ) : (
                  <span className='border-muted-foreground/30 text-muted-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium'>
                    Inactive
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-xs font-medium uppercase'>
                Last Updated
              </p>
              <p className='text-foreground mt-1'>
                {new Date(tag.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
