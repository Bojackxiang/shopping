import React from 'react';

const TagLoading = () => {
  return (
    <div className='flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:gap-6'>
      <div className='w-full flex-shrink-0 space-y-4 lg:w-80'>
        <div className='bg-card border-border animate-pulse rounded-lg border p-4'>
          <div className='bg-muted h-10 rounded-md'></div>
        </div>

        <div className='bg-card border-border flex flex-col gap-2 rounded-lg border p-4'>
          <div className='text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase'>
            Tags
          </div>

          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className='animate-pulse'
              style={{
                animationDelay: `${item * 0.1}s`,
                animationDuration: '1.5s'
              }}
            >
              <div className='flex items-center gap-2 rounded-md p-2'>
                <div className='bg-muted h-4 w-4 flex-shrink-0 rounded-full'></div>
                <div className='bg-muted h-4 flex-1 rounded'></div>
                <div className='bg-primary/20 h-6 w-8 rounded'></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <div className='bg-card border-border flex h-full flex-col gap-6 rounded-lg border p-6'>
          <div className='border-border space-y-4 border-b pb-6'>
            <div className='flex items-center justify-between'>
              <div className='bg-muted h-8 w-48 animate-pulse rounded-md'></div>
              <div className='bg-muted h-10 w-24 animate-pulse rounded-md'></div>
            </div>
            <div className='bg-muted h-4 w-3/4 animate-pulse rounded'></div>
          </div>

          <div className='space-y-6'>
            {[1, 2, 3].map((field) => (
              <div
                key={field}
                className='animate-pulse space-y-2'
                style={{
                  animationDelay: `${field * 0.15}s`,
                  animationDuration: '1.5s'
                }}
              >
                <div className='bg-muted h-4 w-24 rounded'></div>
                <div className='bg-muted h-10 rounded-md'></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='pointer-events-none fixed inset-0 flex items-center justify-center'>
        <div className='bg-background/80 ring-border flex items-center gap-3 rounded-full px-6 py-3 shadow-lg ring-1 backdrop-blur-sm'>
          <div className='relative h-5 w-5'>
            <div className='bg-primary absolute inset-0 animate-ping rounded-full opacity-20'></div>
            <div className='bg-primary absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current'></div>
          </div>
          <span className='text-foreground text-sm font-medium'>
            Loading tags...
          </span>
        </div>
      </div>
    </div>
  );
};

export default TagLoading;
