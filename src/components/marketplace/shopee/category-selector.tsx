'use client';

import { getConnectedShopeeShop, getShopeeCategories } from '@/actions/shopee';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Category {
  category_id: number;
  parent_category_id?: number;
  original_category_name?: string;
  display_category_name?: string;
  has_children?: boolean;
}

interface CategorySelectorProps {
  value?: number;
  onChange: (value: number) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    async function loadShopAndCategories() {
      try {
        setLoading(true);
        const shop = await getConnectedShopeeShop();
        if (!shop) {
          toast.error('No Shopee shop connected');
          return;
        }
        setShopId(shop.shopId);

        const list = await getShopeeCategories(shop.shopId);
        // Filter only leaf categories (no children)
        const leafCategories = list.filter((c: any) => !c.has_children);
        setCategories(leafCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    }

    loadShopAndCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.category_id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between'
          disabled={loading || categories.length === 0}
        >
          {value
            ? selectedCategory?.display_category_name || 'Category selected'
            : loading
              ? 'Loading categories...'
              : 'Select category...'}
          {loading ? (
            <Loader2 className='ml-2 h-4 w-4 animate-spin' />
          ) : (
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0'>
        <Command>
          <CommandInput placeholder='Search category...' />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup className='max-h-[300px] overflow-y-auto'>
              {categories.map((category) => (
                <CommandItem
                  key={category.category_id}
                  value={category.display_category_name}
                  onSelect={() => {
                    onChange(category.category_id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.category_id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {category.display_category_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
