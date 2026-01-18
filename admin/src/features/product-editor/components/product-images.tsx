'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
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
import { Upload, X, GripVertical, Star } from 'lucide-react';
import { onToast, onToastError } from '@/lib/toast';
import { useProductForm } from '../context/product-form-context';
import { useConfirmDialog } from '@/components/confirm-dialog-provider';

interface ProductImage {
  id?: string;
  productId?: string;
  url: string;
  publicId?: string | null;
  isCover: boolean;
  altText: string | null;
  sortOrder: number;
  createdAt?: Date;
}

interface ProductImagesProps {
  onChange?: () => void;
}

export default function ProductImages({ onChange }: ProductImagesProps) {
  const { form } = useProductForm();
  const { confirm } = useConfirmDialog();
  const { watch, setValue } = form;

  const productImages = watch('product_images') || [];

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return data;
      });

      const results = await Promise.all(uploadPromises);

      const newImages: ProductImage[] = results.map((result, index) => ({
        id: crypto.randomUUID(), // 生成临时 ID
        url: result.url,
        publicId: result.publicId,
        altText: null,
        sortOrder: productImages.length + index,
        isCover: productImages.length === 0 && index === 0
      }));

      const updatedImages = [...productImages, ...newImages];
      setValue('product_images', updatedImages, { shouldDirty: true });
      onChange?.();

      onToast('Images uploaded successfully!');
    } catch (error) {
      onToastError('Failed to upload images');

      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAltTextChange = (id: string, altText: string) => {
    const updatedImages = productImages.map((img) =>
      img.id === id ? { ...img, altText } : img
    );
    setValue('product_images', updatedImages, { shouldDirty: true });
    onChange?.();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = productImages.findIndex((img) => img.id === draggedId);
    const targetIndex = productImages.findIndex((img) => img.id === targetId);

    const newImages = [...productImages];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    newImages.forEach((img, i) => {
      img.sortOrder = i;
    });

    setValue('product_images', newImages, { shouldDirty: true });
    setDraggedId(null);
    onChange?.();
  };

  const handleSetCoverImage = (id: string) => {
    const updatedImages = productImages.map((img) => ({
      ...img,
      isCover: img.id === id
    }));
    setValue('product_images', updatedImages, { shouldDirty: true });
    onChange?.();
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToDelete = productImages.find((img) => img.id === imageId);

    confirm(
      async () => {
        if (imageToDelete?.publicId) {
          try {
            const response = await fetch('/api/upload/delete', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ publicId: imageToDelete.publicId })
            });

            if (!response.ok) {
              throw new Error('Failed to delete from Cloudinary');
            }
          } catch (error) {
            console.error('Cloudinary delete error:', error);
            toast.error('Failed to delete image from cloud storage', {
              style: {
                background: 'oklch(0.577 0.245 27.325)',
                color: 'white',
                border: '1px solid oklch(0.577 0.245 27.325)'
              }
            });
            return;
          }
        }

        // 从表单中删除
        const updatedImages = productImages.filter((img) => img.id !== imageId);
        setValue('product_images', updatedImages, { shouldDirty: true });
        onChange?.();

        toast.success('Image deleted successfully', {
          style: {
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: '1px solid var(--primary)'
          }
        });
      },
      {
        title: 'Delete Image?',
        description:
          'Are you sure you want to delete this image? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive'
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Manage product photos, set cover image, and arrange order
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleImageUpload}
          className='hidden'
        />
        <Button
          onClick={handleButtonClick}
          variant='outline'
          className='w-full gap-2'
          disabled={isUploading}
        >
          <Upload className='h-4 w-4' />
          {isUploading ? 'Uploading...' : 'Add Image'}
        </Button>

        <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
          {productImages.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(image.id!)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(image.id!)}
              className='group bg-muted relative cursor-grab overflow-hidden rounded-lg transition-all hover:shadow-md active:cursor-grabbing'
            >
              {image.isCover && (
                <div className='absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-white'>
                  <Star className='h-3 w-3 fill-current' />
                  <span className='text-xs font-semibold'>Cover</span>
                </div>
              )}

              <div className='bg-muted flex aspect-square items-center justify-center overflow-hidden'>
                <img
                  src={image.url || '/placeholder.svg'}
                  alt={image.altText || 'Image preview'}
                  className='h-full w-full object-cover'
                />
              </div>

              <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 transition-colors group-hover:bg-black/40 group-hover:opacity-100'>
                <GripVertical className='h-4 w-4 text-white' />
                {!image.isCover && (
                  <button
                    onClick={() => handleSetCoverImage(image.id!)}
                    className='rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600'
                  >
                    Set as Cover
                  </button>
                )}
              </div>

              <button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveImage(image.id!);
                }}
                className='bg-destructive hover:bg-destructive/90 absolute top-2 right-2 rounded-md p-1 text-white opacity-0 transition-opacity group-hover:opacity-100'
              >
                <X className='h-4 w-4' />
              </button>

              <div className='absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/50 to-transparent p-2 transition-transform group-hover:translate-y-0'>
                <p className='text-xs font-medium text-white'>
                  Order: {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>

        {productImages.length > 0 && (
          <div className='space-y-4 border-t pt-4'>
            <div>
              <Label className='text-sm font-medium'>Edit Alt Text</Label>
              <div className='mt-2 max-h-64 space-y-2 overflow-y-auto'>
                {productImages.map((image) => (
                  <div key={image.id} className='flex items-start gap-2'>
                    <div className='relative flex-shrink-0'>
                      <img
                        src={image.url || '/placeholder.svg'}
                        alt={image.altText || 'Image preview'}
                        className='h-10 w-10 rounded object-cover'
                      />
                      {image.isCover && (
                        <div className='absolute -top-1 -right-1 rounded-full bg-amber-500 p-0.5'>
                          <Star className='h-2.5 w-2.5 fill-white text-white' />
                        </div>
                      )}
                    </div>
                    <Input
                      value={image.altText || 'Image description'}
                      onChange={(e) =>
                        handleAltTextChange(image.id!, e.target.value)
                      }
                      placeholder='Describe the image...'
                      className='flex-1 text-sm'
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
