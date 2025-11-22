import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from './_components/profile-form';
import { SecurityForm } from './_components/security-form';

export default function AccountPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading title='Conta' description='Gerencie sua conta' />
        <Separator className='my-6' />
        <div className='grid gap-8 lg:grid-cols-2'>
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium'>Profile</h3>
              <p className='text-muted-foreground text-sm'>
                This is how others will see you on the site.
              </p>
            </div>
            <Separator />
            <ProfileForm />
          </div>

          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium'>Security</h3>
              <p className='text-muted-foreground text-sm'>
                Manage your password and security settings.
              </p>
            </div>
            <Separator />
            <SecurityForm />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
