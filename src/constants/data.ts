import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        description: 'Visão geral do dashboard',
        label: 'Novo',
        shortcut: ['o', 'o'],
        items: []
      }
    ] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Pedidos',
    url: '/dashboard/orders',
    icon: 'order',
    items: []
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: 'product',
    shortcut: ['p', 'p'],
    items: []
  },
  {
    title: 'Marketplace',
    url: '/dashboard/marketplace',
    icon: 'marketplace',
    items: [
      {
        title: 'Amazon',
        url: '/dashboard/marketplace/amazon',
        shortcut: ['a', 'a'],
        items: []
      },
      {
        title: 'Shopee',
        url: '/dashboard/marketplace/shopee',
        label: 'Novo',
        shortcut: ['s', 's'],
        items: []
      },
      {
        title: 'Mercado Livre',
        url: '/dashboard/marketplace/mercadolivre',
        label: 'Novo',
        shortcut: ['m', 'm'],
        items: []
      },
      {
        title: 'TikTok Shop',
        url: '/dashboard/marketplace/tiktok',
        shortcut: ['t', 't'],
        items: []
      },
      {
        title: 'Etsy',
        url: '/dashboard/marketplace/etsy',
        label: 'Em breve',
        disabled: true,
        shortcut: ['e', 'e'],
        items: []
      }
    ]
  }
];
