'use client';

import {
  getProductsForMarketplace,
  MarketplaceType
} from '@/actions/marketplace-products';
import PageContainer from '@/components/layout/page-container';
import { ProductsTab } from '@/components/marketplace/products-tab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Package,
  Settings
} from 'lucide-react';
import { notFound, useSearchParams } from 'next/navigation';
import { use, useEffect, useState } from 'react';

// Mock data for marketplaces
const MARKETPLACES = {
  amazon: {
    name: 'Amazon',
    description:
      'Connect your Amazon Seller Central account to sync orders and inventory.',
    status: 'active',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', // Placeholder
    connectedAt: '2023-10-15',
    features: ['Order Sync', 'Inventory Sync', 'Price Updates']
  },
  shopee: {
    name: 'Shopee',
    description:
      'Integrate with Shopee to manage your products and orders seamlessly.',
    status: 'inactive',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg', // Placeholder
    connectedAt: null,
    features: ['Order Sync', 'Inventory Sync']
  },
  mercadolivre: {
    name: 'Mercado Livre',
    description: 'Manage your Mercado Livre sales directly from the dashboard.',
    status: 'active',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Mercado_Libre_logo.svg', // Placeholder
    connectedAt: '2023-11-01',
    features: ['Order Sync', 'Inventory Sync', 'Messaging']
  },
  tiktok: {
    name: 'TikTok Shop',
    description: 'Sync your TikTok Shop orders and engage with customers.',
    status: 'inactive',
    icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', // Placeholder
    connectedAt: null,
    features: ['Order Sync']
  }
};

type MarketplaceKey = keyof typeof MARKETPLACES;

export default function MarketplacePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [shopeeConnected, setShopeeConnected] = useState(false);
  const [shopeeData, setShopeeData] = useState<{
    shopId?: string;
    connectedAt?: string;
  }>({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [products, setProducts] = useState<{
    exported: any[];
    available: any[];
  }>({ exported: [], available: [] });
  const searchParams = useSearchParams();

  // Handle OAuth callback and check connection status
  useEffect(() => {
    if (slug !== 'shopee') {
      setIsLoadingStatus(false);
      return;
    }

    // Check for success callback (immediate after OAuth)
    const success = searchParams.get('success');
    const shopId = searchParams.get('shop_id');

    if (success === 'true' && shopId) {
      // OAuth just completed successfully
      setShopeeConnected(true);
      setShopeeData({
        shopId,
        connectedAt: new Date().toISOString()
      });
      setIsLoadingStatus(false);

      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/marketplace/shopee');
      return;
    }

    // Check for errors
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    if (error) {
      console.error('OAuth error:', error, message);
      setIsLoadingStatus(false);
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/marketplace/shopee');
      return;
    }

    // Fetch connection status from API
    const checkConnectionStatus = async () => {
      try {
        const response = await fetch('/api/integrations/shopee/status');
        const data = await response.json();

        if (data.connected) {
          setShopeeConnected(true);
          setShopeeData({
            shopId: data.shopId,
            connectedAt: data.connectedAt
          });
        } else {
          setShopeeConnected(false);
          setShopeeData({});
        }
      } catch (error) {
        console.error('Failed to fetch Shopee status:', error);
        // On error, default to not connected
        setShopeeConnected(false);
        setShopeeData({});
      } finally {
        setIsLoadingStatus(false);
      }
    };

    checkConnectionStatus();
  }, [slug, searchParams]);

  // Fetch products for marketplace
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProductsForMarketplace(slug as MarketplaceType);
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();
  }, [slug]);

  // Handle connect button
  const handleConnect = () => {
    window.location.href = '/api/integrations/shopee/auth';
  };

  // Handle disconnect button
  const handleDisconnect = async () => {
    try {
      // Call API to remove from database
      await fetch('/api/integrations/shopee/disconnect', {
        method: 'POST'
      });

      // Update local state
      setShopeeConnected(false);
      setShopeeData({});
    } catch (error) {
      console.error('Failed to disconnect:', error);
      // Still update UI even if API call fails
      setShopeeConnected(false);
      setShopeeData({});
    }
  };

  if (!slug || !Object.keys(MARKETPLACES).includes(slug)) {
    notFound();
  }

  const marketplace = MARKETPLACES[slug as MarketplaceKey];
  const isShopee = slug === 'shopee';
  const isConnected = isShopee
    ? shopeeConnected
    : marketplace.status === 'active';
  const error = searchParams.get('error');
  const errorMessage = searchParams.get('message');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Error Alert */}
        {error && (
          <Card className='border-destructive'>
            <CardContent className='pt-6'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='text-destructive mt-0.5 h-5 w-5' />
                <div className='flex-1'>
                  <h3 className='text-destructive font-semibold'>
                    Connection Error
                  </h3>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    {errorMessage || 'Failed to connect to marketplace'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header Section */}
        <div className='flex items-center justify-between'>
          <Heading
            title={marketplace.name}
            description={marketplace.description}
          />
          <div className='flex items-center gap-2'>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </Badge>
            <Button variant='outline' size='sm' asChild>
              <a href='/api/integrations/shopee/debug' target='_blank'>
                <ExternalLink className='mr-2 h-4 w-4' />
                Debug Info
              </a>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='products'>
              <Package className='mr-2 h-4 w-4' />
              Products
            </TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
            <TabsTrigger value='logs'>Logs</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Status</CardTitle>
                  <CheckCircle2 className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold capitalize'>
                    {isConnected ? 'Connected' : 'Inactive'}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {isConnected
                      ? `Connected${shopeeData.connectedAt ? ` on ${new Date(shopeeData.connectedAt).toLocaleDateString()}` : marketplace.connectedAt ? ` since ${marketplace.connectedAt}` : ''}`
                      : 'Not connected yet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Features
                  </CardTitle>
                  <Settings className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {marketplace.features.map((feature) => (
                      <Badge key={feature} variant='outline'>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Integration Details</CardTitle>
                <CardDescription>{marketplace.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isShopee && isLoadingStatus ? (
                  <div className='flex flex-col items-center justify-center space-y-4 py-6'>
                    <p className='text-muted-foreground'>
                      Checking connection status...
                    </p>
                  </div>
                ) : !isConnected ? (
                  <div className='flex flex-col items-center justify-center space-y-4 py-6'>
                    <p className='text-muted-foreground'>
                      This marketplace is not connected.
                    </p>
                    {isShopee ? (
                      <Button onClick={handleConnect}>
                        Connect {marketplace.name}
                      </Button>
                    ) : (
                      <Button>Connect {marketplace.name}</Button>
                    )}
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                      {isShopee && shopeeData.shopId ? (
                        <>
                          <div className='space-y-1'>
                            <p className='text-sm leading-none font-medium'>
                              Shop ID
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              {shopeeData.shopId}
                            </p>
                          </div>
                          <div className='space-y-1'>
                            <p className='text-sm leading-none font-medium'>
                              Access Token
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              **************************
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='space-y-1'>
                            <p className='text-sm leading-none font-medium'>
                              API Key
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              **************************
                            </p>
                          </div>
                          <div className='space-y-1'>
                            <p className='text-sm leading-none font-medium'>
                              Store ID
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              STORE-123456
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {isShopee ? (
                      <Button variant='destructive' onClick={handleDisconnect}>
                        Disconnect
                      </Button>
                    ) : (
                      <Button variant='destructive'>Disconnect</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='products'>
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Export local products to {marketplace.name} or manage already
                  exported items.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className='flex flex-col items-center justify-center space-y-4 py-6'>
                    <p className='text-muted-foreground'>
                      Connect {marketplace.name} to manage products.
                    </p>
                  </div>
                ) : (
                  <ProductsTab
                    exportedProducts={products.exported}
                    availableProducts={products.available}
                    marketplace={slug}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='settings'>
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure how {marketplace.name} syncs with your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <p className='text-muted-foreground text-sm'>
                  Settings content placeholder...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='logs'>
            <Card>
              <CardHeader>
                <CardTitle>Sync Logs</CardTitle>
                <CardDescription>
                  View recent synchronization activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm'>
                  Logs content placeholder...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
