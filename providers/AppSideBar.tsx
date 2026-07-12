'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { Crown, Heart, LogOut, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { mockUser } from '@/providers/mock-user';
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
import SidebarHeaderContent from '@/providers/SidebarHeaderContent';

const user = mockUser;

function SidebarShopMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams?.get('category') || 'all';

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');

    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }

    const query = params.toString();

    router.push(query ? `/store?${query}` : '/store', {
      scroll: false
    });
  };

  return (
    <SidebarMenu className="space-y-1">
      {categories.map(category => (
        <SidebarMenuItem key={category.id}>
          <SidebarMenuButton
            size="lg"
            isActive={activeCategory === category.slug}
            onClick={() => handleCategoryChange(category.slug)}
            tooltip={category.label}
            className="h-12 rounded-2xl px-2 transition-all data-[active=true]:bg-secondary/10 data-[active=true]:text-secondary">
            <Image
              src={category.image}
              alt={category.label}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-xl object-cover"
            />

            <span className="font-semibold">{category.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const cartCount = user?.cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const wishlistCount = user?.wishlist?.length ?? 0;

  return (
    <Sidebar className="">
      <div className="flex h-full flex-col overflow-hidden rounded-md shadow-sm backdrop-blur-xl">
        <SidebarHeader className="px-4 pb-3 pt-4">
          <SidebarHeaderContent />
        </SidebarHeader>

        <SidebarContent className="px-3">
          <SidebarGroup className=" p-3">
            <SidebarGroupLabel className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Shop
            </SidebarGroupLabel>

            <Suspense
              fallback={
                <div className="space-y-2 p-2">
                  <div className="h-10 animate-pulse rounded-xl bg-muted" />
                  <div className="h-10 animate-pulse rounded-xl bg-muted" />
                </div>
              }>
              <SidebarShopMenu />
            </Suspense>
          </SidebarGroup>

          <div className="mt-4 rounded-3xl border border-white/5 bg-background/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Crown className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-black">AJ Premium</h3>
                <p className="text-xs text-muted-foreground">Priority service</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Priority delivery, exclusive discounts and premium event services.
            </p>

            <button className="mt-4 w-full rounded-2xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground transition hover:opacity-90">
              Upgrade
            </button>
          </div>
        </SidebarContent>

        <SidebarFooter className="mt-auto p-3">
          <div className="mt-4 rounded-3xl border border-white/5 bg-background/50 p-4">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-bold">{user.name.charAt(0)}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-bold">{user.name}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-muted">
                    <Heart className="h-4 w-4 text-secondary" />
                    Wishlist ({wishlistCount})
                  </button>

                  <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-muted">
                    <ShoppingCart className="h-4 w-4 text-secondary" />
                    Cart ({cartCount})
                  </button>

                  <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-red-500 transition hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold">Welcome</p>
                  <p className="text-xs text-muted-foreground">Sign in to access cart & wishlist</p>
                </div>

                <button className="w-full rounded-2xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
                  Sign In
                </button>
              </div>
            )}
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
