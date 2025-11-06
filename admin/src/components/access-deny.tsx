'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { SignOutButton } from '@clerk/nextjs';

interface AccessDenyProps {
  title?: string;
  description?: string;
  showSignOut?: boolean;
}

const AccessDeny: React.FC<AccessDenyProps> = ({
  title = 'Access Denied',
  description = 'You do not have the required permissions to access this resource. Only administrators are allowed to view this content.',
  showSignOut = true
}) => {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='border-destructive/20 mx-auto w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-4 text-center'>
          <div className='bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
            <Icons.warning className='text-destructive h-8 w-8' />
          </div>
          <CardTitle className='text-destructive text-xl font-semibold'>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-6'>
          <p className='text-muted-foreground text-center text-sm leading-relaxed'>
            {description}
          </p>

          <div className='space-y-3'>
            {showSignOut && (
              <SignOutButton redirectUrl='/auth/sign-in'>
                <Button variant='outline' className='w-full'>
                  <Icons.login className='mr-2 h-4 w-4' />
                  Sign Out & Try Different Account
                </Button>
              </SignOutButton>
            )}
          </div>

          <div className='border-border border-t pt-4'>
            <div className='text-muted-foreground flex items-center justify-center space-x-2 text-xs'>
              <Icons.help className='h-3 w-3' />
              <span>Contact administrator for assistance</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDeny;
