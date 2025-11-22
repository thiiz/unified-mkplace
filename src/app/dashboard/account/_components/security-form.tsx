'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SecurityFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SecurityFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(data: SecurityFormValues) {
    if (data.newPassword !== data.confirmPassword) {
      form.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true
      });

      if (error) {
        toast.error(error.message || 'Failed to update password');
        return;
      }

      toast.success('Password updated successfully');
      form.reset();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='currentPassword'
          rules={{ required: 'Current password is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Current password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='newPassword'
          rules={{
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='New password' {...field} />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          rules={{ required: 'Please confirm your new password' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Confirm new password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </Form>
  );
}
