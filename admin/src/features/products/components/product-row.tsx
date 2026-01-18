'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Eye, Copy, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfirmDialog } from '@/components/confirm-dialog-provider';
import { deleteProduct } from '@/repositories';
import {
  getStatusLabel,
  getStatusStyles,
  getVisibilityStyles
} from '../utils/product-status';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  visibility: string;
  image: string;
  variants: number;
  sales: number;
  updated: string;
}

interface ProductRowProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  refetchProducts: () => void;
}

export function ProductRow({
  product,
  isSelected,
  onSelect,
  refetchProducts
}: ProductRowProps) {
  const router = useRouter();

  const { confirm } = useConfirmDialog();

  // Edit Product button click handler
  const handleEditProductClicked = () => {
    router.push(`/dashboard/product/${product.id}/edit`);
  };

  const handleDeleteProductClicked = async () => {
    await confirm(
      async () => {
        try {
          await deleteProduct(product.id);

          await refetchProducts();
        } catch (error) {}
      },
      {
        title: 'Delete Product?',
        description:
          'Are you sure you want to delete this Product? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive'
      }
    );
  };

  return (
    <tr className='hover:bg-muted transition-colors'>
      <td className='w-12 px-4 py-3'>
        <Checkbox checked={isSelected} onChange={onSelect} />
      </td>
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className='bg-muted h-10 w-10 rounded-lg object-cover'
          />
          <div>
            <p className='text-sm font-medium'>{product.name}</p>
            <p className='text-muted-foreground text-xs'>
              {product.variants} variant{product.variants !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </td>
      <td className='px-4 py-3 text-sm font-medium'>
        ${product.price.toFixed(2)}
      </td>
      <td className='px-4 py-3'>
        <div className='flex items-center gap-2'>
          <div
            className={`h-2 w-2 rounded-full ${
              product.stock === 0
                ? 'bg-red-500'
                : product.stock < 10
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
          />
          <span className='text-sm'>
            {product.stock} {product.stock === 1 ? 'item' : 'items'}
          </span>
        </div>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(product.status)}`}
        >
          {getStatusLabel(product.status)}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getVisibilityStyles(product.visibility)}`}
        >
          {product.visibility === 'published' ? 'Published' : 'Unpublished'}
        </span>
      </td>
      <td className='px-4 py-3 text-sm font-medium'>{product.sales}</td>
      <td className='text-muted-foreground px-4 py-3 text-sm'>
        {product.updated}
      </td>
      <td className='px-4 py-3 text-right'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleEditProductClicked}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className='mr-2 h-4 w-4' />
              Preview (Coming Soon)
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className='mr-2 h-4 w-4' />
              Duplicate (Coming Soon)
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-destructive'
              onClick={handleDeleteProductClicked}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
