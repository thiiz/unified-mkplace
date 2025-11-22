import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    description: 'Visão geral do dashboard',

    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        description: 'Visão geral do dashboard',
        external: true,
        disabled: false,
        label: 'Novo',
        shortcut: ['o', 'o'],
        icon: 'dashboard',
        items: []
      }
    ] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Pedidos',
    url: '/dashboard/orders',
    icon: 'order',
    items: []
  }
];
