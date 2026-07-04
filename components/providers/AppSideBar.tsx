'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { Crown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockUser } from '@/components/providers/mock-user';
import { useSidebar } from '@/components/ui/sidebar';
import { X } from 'lucide-react';

const user = mockUser;

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

import { categories } from '@/data/categories';
import SidebarHeaderContent from './SidebarHeaderContent';

// 1. Extract the dynamic menu items into a sub-component
function SidebarShopMenu() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Safe here inside Suspense!

  const activeCategory = searchParams?.get('category') || '';

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('category', slug);

    router.push(`/store?${params.toString()}`, {
      scroll: false
    });
  };

  return (
    <SidebarMenu>
      {categories.map(category => (
        <SidebarMenuItem key={category.id}>
          <SidebarMenuButton
            size="lg"
            isActive={activeCategory === category.slug}
            onClick={() => handleCategoryChange(category.slug)}
            tooltip={category.label}>
            <Image
              src={category.image}
              alt={category.label}
              width={40}
              height={40}
              className="size-10 rounded-md object-cover shrink-0"
            />
            <span>{category.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// 2. Main exported component
export function AppSidebar() {
  const cartCount = user?.cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishlistCount = user?.wishlist?.length ?? 0;

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <SidebarHeaderContent />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Shop</SidebarGroupLabel>

          {/* 3. Wrap the dynamic menu in a Suspense block */}
          <Suspense
            fallback={
              <div className="space-y-2 p-2 animate-pulse">
                <div className="h-10 bg-zinc-900 rounded-md" />
                <div className="h-10 bg-zinc-900 rounded-md" />
              </div>
            }>
            <SidebarShopMenu />
          </Suspense>
        </SidebarGroup>

        {/* PREMIUM UPGRADE CARD */}
        <div className="mx-3 mt-6 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Crown className="size-4 text-yellow-500" />
            <span className="font-medium">AJ Premium</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Priority delivery, exclusive discounts and premium event services.
          </p>
          <button className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground cursor-pointer">
            Upgrade
          </button>
        </div>
      </SidebarContent>

      {/* FOOTER USER SHELF */}
      <SidebarFooter className="border-t p-4">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} width={40} height={40} className="object-cover" />
                ) : (
                  <span className="font-semibold">{user.name.charAt(0)}</span>
                )}
              </div>

              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1 text-sm mt-2">
              <button className="w-full text-left hover:bg-muted px-2 py-1 rounded-md cursor-pointer">
                ❤️ Wishlist ({wishlistCount})
              </button>
              <button className="w-full text-left hover:bg-muted px-2 py-1 rounded-md cursor-pointer">
                🛒 Cart ({cartCount})
              </button>
              <button className="w-full text-left hover:bg-muted px-2 py-1 rounded-md text-red-500 cursor-pointer">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">Welcome</p>
            <p className="text-xs text-muted-foreground">Sign in to access cart & wishlist</p>
            <button className="w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground cursor-pointer">
              Sign In
            </button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
