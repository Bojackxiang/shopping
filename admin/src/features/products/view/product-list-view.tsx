'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductFilters } from '../components/product-filters';
import { ProductTable } from '../components/product-table';
import { ProductPagination } from '../components/product-pagination';
import { EmptyState } from '../components/empty-state';
import { useProductListData } from '../hooks/use-product-list-data';
import { ProductStatus } from '@prisma/client';
import { delay } from '@/utils/delay';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 转换 Prisma 数据到组件所需格式
function transformProductData(products: any[]) {
  return products.map((product) => {
    // 获取第一个变体的价格（如果有）
    const firstVariant = product.variants?.[0];
    const price = firstVariant ? Number(firstVariant.price) : 0;

    // 计算总库存
    const stock =
      product.variants?.reduce((sum: number, v: any) => sum + v.inventory, 0) ||
      0;

    // 转换状态 - 直接使用 ProductStatus 枚举值
    const status = product.status; // DRAFT, ACTIVE, or ARCHIVED

    // 转换可见性
    const visibility =
      product.status === ProductStatus.ACTIVE ? 'published' : 'unpublished';

    // 格式化更新时间
    const updated = formatRelativeTime(new Date(product.updatedAt));

    return {
      id: product.id,
      name: product.name,
      price,
      stock,
      status,
      visibility,
      image:
        product.thumbnail ||
        product.product_images?.[0]?.url ||
        '/placeholder.svg',
      variants: product._count?.variants || product.variants?.length || 0,
      sales: product.salesCount || 0,
      updated
    };
  });
}

// 格式化相对时间
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

export function ProductListView() {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [localFilters, setLocalFilters] = useState({
    status: 'all',
    visibility: 'all',
    search: ''
  });

  // 使用 useProductListData hook
  const {
    data: rawProducts,
    isLoading,
    isRefetching,
    error,
    pagination,
    setPage,
    setPageSize,
    setFilters,
    refetch
  } = useProductListData({
    initialPageSize: 10,
    orderBy: 'createdAt'
  });

  console.log({ rawProducts });

  // 转换数据格式
  const products = useMemo(() => {
    return transformProductData(rawProducts);
  }, [rawProducts]);

  // 应用本地筛选（status 和 visibility 需要转换）
  useEffect(() => {
    const filters: any = {};

    // 转换 status
    if (localFilters.status !== 'all') {
      if (localFilters.status === 'active') {
        filters.status = ProductStatus.ACTIVE;
        filters.isActive = true;
      } else if (localFilters.status === 'draft') {
        filters.status = ProductStatus.DRAFT;
      } else if (localFilters.status === 'out_of_stock') {
        filters.status = ProductStatus.ACTIVE;
      }
    }

    // 转换 visibility
    if (localFilters.visibility !== 'all') {
      if (localFilters.visibility === 'published') {
        filters.status = ProductStatus.ACTIVE;
      } else if (localFilters.visibility === 'unpublished') {
        filters.status = ProductStatus.DRAFT;
      }
    }

    // 搜索
    if (localFilters.search) {
      filters.search = localFilters.search;
    }

    setFilters(filters);
  }, [localFilters, setFilters]);

  // 前端筛选 out_of_stock（因为这个状态是计算出来的）
  const filteredProducts = useMemo(() => {
    if (localFilters.status === 'out_of_stock') {
      return products.filter((p) => p.stock === 0);
    }
    return products;
  }, [products, localFilters.status]);

  // 延迟函数用于 loading 和 refetch
  const handleRefetch = async () => {
    await refetch();
  };

  const handlePageChange = async (page: number) => {
    setPage(page);
  };

  const handlePageSizeChange = async (pageSize: number) => {
    setPageSize(pageSize);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handleFilterChange = (filters: typeof localFilters) => {
    setLocalFilters(filters);
  };

  const isEmpty = filteredProducts.length === 0 && !isLoading;
  const showLoading = isLoading || isRefetching;

  return (
    <div className='flex h-[calc(100vh-220px)] flex-col'>
      {/* Filters - 固定高度 */}
      <div className='flex-shrink-0'>
        <ProductFilters
          filters={localFilters}
          onFiltersChange={handleFilterChange}
          productCount={pagination?.total || 0}
        />
      </div>

      {/* Content area - 可滚动区域 */}
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {/* Loading state */}
        {showLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
              <p className='text-muted-foreground text-sm'>
                {isRefetching
                  ? 'Refreshing products...'
                  : 'Loading products...'}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !showLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <p className='text-destructive mb-2 text-sm font-medium'>
                Error loading products
              </p>
              <p className='text-muted-foreground mb-4 text-xs'>
                {error.message}
              </p>
              <Button onClick={handleRefetch} size='sm' variant='outline'>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Products table */}
        {!showLoading && !error && (
          <>
            {isEmpty ? (
              <EmptyState />
            ) : (
              <ProductTable
                products={filteredProducts}
                selectedProducts={selectedProducts}
                onSelectAll={handleSelectAll}
                onSelectProduct={handleSelectProduct}
                isAllSelected={
                  selectedProducts.size === filteredProducts.length &&
                  filteredProducts.length > 0
                }
                refetchProducts={handleRefetch}
              />
            )}
          </>
        )}
      </div>

      {/* Pagination - 固定在底部 */}
      {!isEmpty && !showLoading && !error && pagination && (
        <div className='flex-shrink-0 border-t'>
          <ProductPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
