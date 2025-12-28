'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlobalLoadingProps {
  isOpen: boolean;
  message?: string;
}

const GlobalLoading = ({ isOpen, message }: GlobalLoadingProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-background/80 backdrop-blur-md',
        'animate-in fade-in duration-200'
      )}
    >
      <div className='flex flex-col items-center gap-6'>
        {/* Modern Spinner */}
        <div className='relative'>
          {/* Outer ring */}
          <div className='border-primary/20 h-20 w-20 animate-spin rounded-full border-4 border-t-transparent' />

          {/* Inner glow effect */}
          <div className='bg-primary/10 absolute inset-0 m-auto h-16 w-16 animate-pulse rounded-full' />

          {/* Center dot */}
          <div className='bg-primary absolute inset-0 m-auto h-3 w-3 animate-pulse rounded-full' />
        </div>

        {/* Loading text with animated dots */}
        {message && (
          <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
            <p className='text-foreground/80 text-center text-sm font-medium'>
              {message}
              <span className='inline-flex w-8'>
                <span className='animation-delay-0 animate-pulse'>.</span>
                <span className='animation-delay-200 animate-pulse'>.</span>
                <span className='animation-delay-400 animate-pulse'>.</span>
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;
