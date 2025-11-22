import PageContainer from '@/components/layout/page-container';
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
import { CheckCircle2, ExternalLink, Settings } from 'lucide-react';
import { notFound } from 'next/navigation';

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

export default async function MarketplacePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!Object.keys(MARKETPLACES).includes(slug)) {
    notFound();
  }

  const marketplace = MARKETPLACES[slug as MarketplaceKey];

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Header Section */}
        <div className='flex items-center justify-between'>
          <Heading
            title={marketplace.name}
            description={marketplace.description}
          />
          <div className='flex items-center gap-2'>
            <Badge
              variant={
                marketplace.status === 'active' ? 'default' : 'secondary'
              }
            >
              {marketplace.status === 'active' ? 'Connected' : 'Not Connected'}
            </Badge>
            <Button variant='outline' size='sm'>
              <ExternalLink className='mr-2 h-4 w-4' />
              Documentation
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
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
                    {marketplace.status}
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {marketplace.connectedAt
                      ? `Connected since ${marketplace.connectedAt}`
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
                {marketplace.status === 'inactive' ? (
                  <div className='flex flex-col items-center justify-center space-y-4 py-6'>
                    <p className='text-muted-foreground'>
                      This marketplace is not connected.
                    </p>
                    <Button>Connect {marketplace.name}</Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
                    </div>
                    <Button variant='destructive'>Disconnect</Button>
                  </div>
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
