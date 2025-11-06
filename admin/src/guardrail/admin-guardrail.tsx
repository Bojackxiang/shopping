'use client';
import React from 'react';
import { useUser } from '@clerk/nextjs';
import AccessDeny from '@/components/access-deny';

const AdminGuardRail = ({ children }: React.PropsWithChildren) => {
  const { user, isLoaded, isSignedIn } = useUser();

  // 等待用户数据加载
  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
      </div>
    );
  }

  // 检查用户是否已登录
  if (!isSignedIn) {
    return (
      <AccessDeny
        title='Authentication Required'
        description='Please sign in to access this administrative area. Only authenticated administrators are allowed to view this content.'
        showSignOut={false}
      />
    );
  }

  const { role } = user?.publicMetadata || {};

  // 检查用户是否是管理员
  if (role !== 'admin') {
    return (
      <AccessDeny
        title='Administrator Access Required'
        description='This area is restricted to administrators only. Your current account does not have the necessary permissions to access this content.'
        showSignOut={true}
      />
    );
  }

  return <>{children}</>;
};

export default AdminGuardRail;
