import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Sign up page'
};

export default function SignUpViewPage() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <ClerkSignUpForm
        initialValues={{
          emailAddress: 'your_mail+clerk_test@example.com'
        }}
      />
    </div>
  );
}
