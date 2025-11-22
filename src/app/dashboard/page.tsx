import PageContainer from '@/components/layout/page-container';
import { KPICard } from '@/components/pages/dashboard/kpi-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth';
import { mockKPIs } from '@/lib/mock-data';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Dashboard - Unified Sales'
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Dashboard Unificado de Vendas'
            description='Bem-vindo ao seu painel de controle'
          />
        </div>
        <Separator />

        {session?.user && (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {mockKPIs.map((kpi) => (
              <KPICard key={kpi.label} {...kpi} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
