import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        isActive: false,
        shortcut: ['ctrl', 'd']
      }
    ] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Pedidos',
    url: '/dashboard/orders', // Placeholder as there is no direct link for the parent
    icon: 'order',
    isActive: true,
    shortcut: ['p', 'p'],
    items: [] // No child items
    // items: [
    //   {
    //     title: 'Profile',
    //     url: '/dashboard/#',
    //     icon: 'userPen',
    //     shortcut: ['m', 'm']
    //   },
    //   {
    //     title: 'Login',
    //     shortcut: ['l', 'l'],
    //     url: '/#',
    //     icon: 'login'
    //   }
    // ]
  }
];
