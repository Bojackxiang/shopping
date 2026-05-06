import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'User',
    url: '#',
    icon: 'user',
    isActive: false,
    shortcut: ['c', 'c'],
    items: [
      {
        title: 'Customers',
        url: '/dashboard/customer',
        icon: 'user',
        shortcut: ['m', 'm']
      },
      {
        title: 'Admin',
        url: '/dashboard/admin',
        icon: 'crown',
        shortcut: ['m', 'm']
      }
    ] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Cart',
    url: '#',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [
      {
        title: 'Product',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['m', 'm']
      },
      {
        title: 'Category Management',
        url: '/dashboard/category',
        icon: 'ellipsis',
        shortcut: ['m', 'm']
      },
      {
        title: 'Tag Management',
        url: '/dashboard/tag',
        icon: 'tag',
        shortcut: ['m', 'm']
      }
    ]
  },
  {
    title: 'Coupon',
    url: '#',
    icon: 'couponList',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [
      {
        title: 'Coupons',
        url: '/dashboard/coupons/list',
        icon: 'couponList',
        shortcut: ['m', 'm']
      },
      {
        title: 'Event Log',
        url: '/dashboard/coupons/events',
        icon: 'couponTracking',
        shortcut: ['m', 'm']
      },
      {
        title: 'Coupon Distribution',
        url: '/dashboard/coupon/distribution',
        icon: 'couponDistribution',
        shortcut: ['m', 'm']
      },
      {
        title: 'Usage Tracking',
        url: '/dashboard/coupon/usage-tracking',
        icon: 'couponTracking',
        shortcut: ['m', 'm']
      },
      {
        title: 'Coupon Analytics',
        url: '/dashboard/coupon/analytics',
        icon: 'couponAnalysts',
        shortcut: ['m', 'm']
      }
    ]
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Orders',
    url: '/dashboard/order', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: false
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
