'use client';

// React & Third-party
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import ProductBasicInfo from './product-basic-info';
import ProductImages from './product-images';
import ProductVariants from './product-variants';
import ProductMetadata from './product-metadata';
import ProductSEO from './product-seo';
import PublishSection from './publish-section';
import ProductNotFound from './product-not-found';

// Business Logic & Hooks
import { useProductData } from '../hooks/use-product-data';
import useUpdateProductData from '../hooks/use-update-product';
import { productFormSchema, ProductFormData } from '../schemas/product-schema';
import { ProductFormProvider } from '../context/product-form-context';
import { ProductStatus } from '@prisma/client';
import { getErrorMessage } from '../utils/product-error-handler';
import { onToast, onToastError } from '@/lib/toast';
import { delay } from '@/utils/delay';
import { useRouter } from 'next/navigation';

interface ProductEditorProps {
  productId: string;
}

export default function ProductEditor(props: ProductEditorProps) {
  const { productId } = props;
  const router = useRouter();
  // ====== Data Hooks ======
  const { data: product, error, isLoading } = useProductData(productId);
  const { updateProduct } = useUpdateProductData({ productId });

  // ====== Form State ======
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      status: ProductStatus.DRAFT,
      isActive: true,
      isFeatured: false,
      isNew: false,
      product_images: [],
      variants: [],
      product_faqs: [],
      tagIds: []
    }
  });

  // ====== Effects ======
  // Update form when product data loads
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        brandId: product.brandId || null,
        status: product.status || ProductStatus.DRAFT,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        isNew: product.isNew ?? false,
        thumbnail: product.thumbnail || null,
        videoUrl: product.videoUrl || null,
        product_images: product.product_images || [],
        variants: product.variants || [],
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        metaKeywords: product.metaKeywords || '',
        product_faqs: product.product_faqs || [],
        tagIds: product.product_tags?.map((pt: any) => pt.tagId) || []
      });
    }
  }, [product, form]);

  // ====== Handlers ======
  // 提交表单
  const onSubmit = async (data: ProductFormData) => {
    await updateProduct(data);
    onToast(
      'Product saved successfully! And we we are redirecting you back to the products list.'
    );

    delay(1500);

    router.push('/dashboard/product');
  };

  // 表单错误处理
  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0];
    const firstError = errors[firstErrorField];
    if (firstError) {
      const fieldName = getErrorMessage(firstErrorField);
      const errorMessage = firstError.message || 'Invalid input';
      onToastError('Please check the form', `${fieldName}: ${errorMessage}`);
    } else {
      onToastError('Please check the form for errors');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-muted-foreground'>Loading product...</div>
      </div>
    );
  }

  // Error/Not found and is not creating new
  if ((error || !product) && productId.trim() !== '')
    return <ProductNotFound productId={productId} />;

  if (!productId && productId.trim() !== '') return <ProductNotFound />;

  const { isDirty, isSubmitting } = form.formState;

  return (
    <ProductFormProvider
      value={{
        form,
        isSubmitting,
        isDirty
      }}
    >
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className='w-full'>
        {/* Header */}
        <div className='border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur'>
          <div className='flex items-center justify-between px-6 py-4'>
            <div>
              <h1 className='text-foreground text-2xl font-semibold'>
                Product Editor
              </h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                Manage your product details and inventory
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {isDirty && (
                <span className='text-sm text-amber-600 dark:text-amber-400'>
                  Unsaved changes
                </span>
              )}
              <Button
                type='submit'
                disabled={!isDirty || isSubmitting}
                className='gap-2'
              >
                <Save className='h-4 w-4' />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-10xl mx-auto grid grid-cols-1 gap-6 p-6 lg:grid-cols-3'>
          {/* Left Column - Main Sections */}
          <div className='space-y-6 lg:col-span-2'>
            <ProductBasicInfo />
            <ProductImages />
            <ProductVariants />
            <ProductSEO />
          </div>

          {/* Right Column - Sidebar */}
          <div className='space-y-6'>
            <ProductMetadata productId={productId} />
            <PublishSection />
          </div>
        </div>
      </form>
    </ProductFormProvider>
  );
}
