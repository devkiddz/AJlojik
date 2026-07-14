'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import { Crown, Heart, LogOut, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useIdentity } from '@/providers/IdentityProvider';

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

/**
 * Store category navigation.
 *
 * This component owns only route/category behavior.
 */
function SidebarShopMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') ?? 'all';

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());

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

/**
 * Main application sidebar.
 *
 * This component owns the authenticated identity presentation.
 */
export function AppSidebar() {
  const router = useRouter();

  const { user, isAuthenticated, isPending, signOut } = useIdentity();

  /**
   * Temporary placeholders.
   * These will come from the Commerce Provider shortly.
   */
  const cartCount = 0;
  const wishlistCount = 0;

  return (
    <Sidebar>
      <div className="flex h-full flex-col overflow-hidden rounded-md shadow-sm backdrop-blur-xl">
        <SidebarHeader className="px-4 pb-3 pt-4">
          <SidebarHeaderContent />
        </SidebarHeader>

        <SidebarContent className="px-3">
          {/* Store navigation */}
          <SidebarGroup className="p-3">
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

          {/* Premium membership promotion */}
          <div className="mt-4 rounded-3xl border border-white/5 bg-background/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Crown className="size-4" />
              </div>

              <div>
                <h3 className="text-sm font-black">AJ Premium</h3>

                <p className="text-xs text-muted-foreground">Priority service</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Priority delivery, exclusive discounts and premium event services.
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground transition hover:opacity-90">
              Upgrade
            </button>
          </div>
        </SidebarContent>

        {/* Real account identity */}
        <SidebarFooter className="mt-auto p-3">
          <div className="rounded-3xl border border-white/5 bg-background/50 p-4">
            {isPending ? (
              <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-xl bg-muted" />
                <div className="h-9 animate-pulse rounded-xl bg-muted" />
              </div>
            ) : isAuthenticated && user ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push('/account')}
                  className="flex w-full items-center gap-3 rounded-2xl text-left">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="size-10 object-cover"
                      />
                    ) : (
                      <span className="font-bold">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{user.name}</p>

                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>

                    <p className="mt-0.5 text-[10px] font-semibold capitalize text-primary">
                      {user.tier} member
                    </p>
                  </div>
                </button>

                <div className="mt-3 space-y-1 text-sm">
                  <button
                    type="button"
                    onClick={() => router.push('/wishlist')}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-muted">
                    <Heart className="size-4 text-secondary" />
                    Wishlist ({wishlistCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/cart')}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-muted">
                    <ShoppingCart className="size-4 text-secondary" />
                    Cart ({cartCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-red-500 transition hover:bg-red-500/10">
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold">Welcome to AJ Logik</p>

                  <p className="text-xs leading-5 text-muted-foreground">
                    Sign in to save your cart, wishlist and personal experience.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/sign-in')}
                  className="w-full rounded-2xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
                  Sign in
                </button>
              </div>
            )}
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
