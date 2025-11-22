export interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  stock: number;
  price: number;
  channels: {
    mercadolivre: { active: boolean; error?: boolean };
    shopee: { active: boolean; error?: boolean };
    amazon: { active: boolean; error?: boolean };
    magalu: { active: boolean; error?: boolean };
  };
}

export interface Order {
  id: string;
  marketplace: 'mercadolivre' | 'shopee' | 'amazon' | 'magalu';
  customer: string;
  date: Date;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  total: number;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fone de Ouvido Bluetooth Premium',
    sku: 'FON-BT-001',
    image: '/placeholder.svg',
    stock: 45,
    price: 159.9,
    channels: {
      mercadolivre: { active: true },
      shopee: { active: true },
      amazon: { active: false },
      magalu: { active: true, error: true }
    }
  },
  {
    id: '2',
    name: 'Mouse Gamer RGB 7200 DPI',
    sku: 'MSE-GAM-002',
    image: '/placeholder.svg',
    stock: 23,
    price: 89.9,
    channels: {
      mercadolivre: { active: true },
      shopee: { active: true },
      amazon: { active: true },
      magalu: { active: false }
    }
  },
  {
    id: '3',
    name: 'Teclado Mecânico Switch Blue',
    sku: 'TEC-MEC-003',
    image: '/placeholder.svg',
    stock: 0,
    price: 349.9,
    channels: {
      mercadolivre: { active: false },
      shopee: { active: false },
      amazon: { active: false },
      magalu: { active: false }
    }
  },
  {
    id: '4',
    name: 'Webcam Full HD 1080p',
    sku: 'WEB-HD-004',
    image: '/placeholder.svg',
    stock: 67,
    price: 249.9,
    channels: {
      mercadolivre: { active: true },
      shopee: { active: true },
      amazon: { active: true },
      magalu: { active: true }
    }
  },
  {
    id: '5',
    name: 'Headset Gamer 7.1 Surround',
    sku: 'HDS-GAM-005',
    image: '/placeholder.svg',
    stock: 12,
    price: 279.9,
    channels: {
      mercadolivre: { active: true },
      shopee: { active: false },
      amazon: { active: true },
      magalu: { active: false }
    }
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ML-2024-001234',
    marketplace: 'mercadolivre',
    customer: 'João Silva Santos',
    date: new Date('2024-01-15T10:30:00'),
    status: 'paid',
    total: 159.9
  },
  {
    id: 'SHP-2024-005678',
    marketplace: 'shopee',
    customer: 'Maria Oliveira Costa',
    date: new Date('2024-01-15T09:15:00'),
    status: 'pending',
    total: 89.9
  },
  {
    id: 'AMZ-2024-009876',
    marketplace: 'amazon',
    customer: 'Pedro Henrique Alves',
    date: new Date('2024-01-14T18:45:00'),
    status: 'shipped',
    total: 249.9
  },
  {
    id: 'MAG-2024-003456',
    marketplace: 'magalu',
    customer: 'Ana Paula Ferreira',
    date: new Date('2024-01-14T16:20:00'),
    status: 'cancelled',
    total: 279.9
  },
  {
    id: 'ML-2024-007890',
    marketplace: 'mercadolivre',
    customer: 'Carlos Eduardo Lima',
    date: new Date('2024-01-14T14:10:00'),
    status: 'shipped',
    total: 349.9
  }
];

import { DollarSign, Link, PackageX, ShoppingBag } from 'lucide-react';

export interface KPI {
  label: string;
  value: string;
  change?: number;
  type?: 'success' | 'warning' | 'error';
  icon?: React.ElementType;
}

export const mockKPIs: KPI[] = [
  {
    label: 'Faturamento Hoje',
    value: 'R$ 2.847,60',
    change: 12.5,
    type: 'success',
    icon: DollarSign
  },
  {
    label: 'Pedidos Pendentes',
    value: '8',
    change: -3.2,
    type: 'warning',
    icon: ShoppingBag
  },
  {
    label: 'Produtos Sem Estoque',
    value: '3',
    change: 1,
    type: 'error',
    icon: PackageX
  },
  {
    label: 'Marketplaces Conectados',
    value: '3/4',
    type: 'success',
    icon: Link
  }
];

export const mockSalesData = [
  { day: 'Seg', mercadolivre: 450, shopee: 320, amazon: 180, magalu: 0 },
  { day: 'Ter', mercadolivre: 520, shopee: 280, amazon: 220, magalu: 150 },
  { day: 'Qua', mercadolivre: 480, shopee: 350, amazon: 190, magalu: 120 },
  { day: 'Qui', mercadolivre: 610, shopee: 420, amazon: 250, magalu: 180 },
  { day: 'Sex', mercadolivre: 590, shopee: 390, amazon: 280, magalu: 160 },
  { day: 'Sáb', mercadolivre: 720, shopee: 480, amazon: 310, magalu: 220 },
  { day: 'Dom', mercadolivre: 380, shopee: 260, amazon: 150, magalu: 90 }
];

export interface Marketplace {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  color: string;
}

export const mockMarketplaces: Marketplace[] = [
  {
    id: 'mercadolivre',
    name: 'Mercado Livre',
    logo: '🛒',
    connected: true,
    color: '#FFE600'
  },
  {
    id: 'shopee',
    name: 'Shopee',
    logo: '🛍️',
    connected: true,
    color: '#EE4D2D'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    connected: true,
    color: '#FF9900'
  },
  {
    id: 'magalu',
    name: 'Magazine Luiza',
    logo: '🏪',
    connected: false,
    color: '#0086FF'
  }
];
