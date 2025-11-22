'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { authClient } from '@/lib/auth-client';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { UserMenu } from './user-menu';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { data: session } = authClient.useSession();

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader></SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.items?.some(
                    (subItem) => subItem.url === pathname
                  )}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={pathname === item.url}
                            disabled={item.disabled}
                            aria-disabled={item.disabled}
                            onClick={(e) => item.disabled && e.preventDefault()}
                            className={
                              item.disabled
                                ? '!pointer-events-auto opacity-50'
                                : ''
                            }
                          >
                            {item.icon && <Icon />}
                            <span>{item.title}</span>
                            <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      <TooltipContent side='right' align='center'>
                        <p>{item.description || item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                  aria-disabled={subItem.disabled}
                                  className={
                                    subItem.disabled
                                      ? '!pointer-events-auto opacity-50'
                                      : ''
                                  }
                                >
                                  <Link
                                    href={subItem.url}
                                    target={
                                      subItem.external ? '_blank' : undefined
                                    }
                                    rel={
                                      subItem.external
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                    onClick={(e) =>
                                      subItem.disabled && e.preventDefault()
                                    }
                                    className={
                                      subItem.disabled
                                        ? 'pointer-events-none'
                                        : ''
                                    }
                                  >
                                    <span>{subItem.title}</span>
                                    {subItem.label && (
                                      <span className='ml-auto text-xs'>
                                        {subItem.label}
                                      </span>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </TooltipTrigger>
                              <TooltipContent side='right' align='center'>
                                <p>{subItem.description || subItem.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        disabled={item.disabled}
                        aria-disabled={item.disabled}
                        className={
                          item.disabled ? '!pointer-events-auto opacity-50' : ''
                        }
                      >
                        <Link
                          href={item.url}
                          target={item.external ? '_blank' : undefined}
                          rel={
                            item.external ? 'noopener noreferrer' : undefined
                          }
                          onClick={(e) => item.disabled && e.preventDefault()}
                          className={item.disabled ? 'pointer-events-none' : ''}
                        >
                          <Icon />
                          <span>{item.title}</span>
                          {item.label && (
                            <SidebarMenuBadge>{item.label}</SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side='right' align='center'>
                      <p>{item.description || item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu user={session.user} />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
