'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useState } from 'react';
import useCreateProduct from '../hooks/use-create-product';
import { onToastError } from '@/lib/toast';

import { delay } from '@/utils/delay';
import { useRouter } from 'next/navigation';

const NewProductView = () => {
  const { trigger } = useCreateProduct();
  const router = useRouter();
  const [loadingText, setLoadingText] = useState<string>(
    'Please wait while we set things up for you.'
  );
  const hasCreatedRef = React.useRef(false);

  useEffect(() => {
    const createNewProduct = async () => {
      try {
        const { id } = await trigger();

        await delay(1000);

        setLoadingText('Redirecting to your new product...');

        await delay(1500);

        router.push(`/dashboard/product/${id}/edit`);
      } catch (err) {
        onToastError(
          'Error creating new product. Please try again.',
          (err as Error).message
        );
      }
    };

    if (!hasCreatedRef.current) {
      hasCreatedRef.current = true;
      createNewProduct();
    }
  }, []);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4 overflow-x-hidden'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Organization Memberships'
            description='Manage organization members and their roles.'
          />
        </div>
        <Separator />
        <div className='bg-card border-border animate-in fade-in flex flex-1 flex-col items-center justify-center rounded-lg border py-12 shadow-md duration-500'>
          <h2
            className='text-foreground mb-2 text-2xl font-semibold'
            style={{ color: 'var(--color-foreground)' }}
          >
            {loadingText}
          </h2>
          <p
            className='text-muted-foreground mb-2 text-base'
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Please wait while we set things up for you.
          </p>
          <div className='mt-4 animate-spin'>
            <svg
              width='32'
              height='32'
              viewBox='0 0 24 24'
              fill='none'
              className='text-primary'
              style={{ color: 'var(--color-primary)' }}
            >
              <circle
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                opacity='0.2'
              />
              <path
                d='M12 2a10 10 0 0 1 10 10'
                stroke='currentColor'
                strokeWidth='4'
                strokeLinecap='round'
              />
            </svg>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default NewProductView;
