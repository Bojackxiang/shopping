import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='mx-auto w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Admin Dashboard
          </h1>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            Sign in to your account
          </p>
        </div>
        <div className='flex justify-center'>
          <ClerkSignInForm />
        </div>
      </div>
    </div>
  );
}
