'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, UtensilsCrossed, Wine, PartyPopper, TextSearch, ChevronUp } from 'lucide-react';

import UserActionComponent from './UserActionComponent';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';
import SidebarToggle from './shared/SidebarToggle';
import { Button } from './ui/button';
import SearchBarComponent from './SearchBarComponent';
import { MobileSearchButton } from '@/features/search';
import StoreCategoriesPill from './store/StoreCategoriesPill';
import PremiumStoreButton from './ui/premium-store-button';

type BrandType = {
  brandName: string;
  brandSlug: string;
};

const brands = [
  { id: 'all', label: 'All', icon: LayoutGrid, slug: 'all' },
  { id: 'kitchen', label: 'AJ Kitchen', icon: UtensilsCrossed, slug: 'kitchen' },
  { id: 'liqz', label: 'AJ Liqz', icon: Wine, slug: 'wines' },
  { id: 'party', label: 'Party Plans', icon: PartyPopper, slug: 'party-plans' }
];

export default function NavbarComponent({ brandName, brandSlug }: BrandType) {
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';
  const isStorePage = pathname.startsWith('/store');

  const isLoggedIn = true;

  const user = {
    name: 'Dennis Okaro Jones',
    email: 'developer@ajlogiks.com',
    image: 'https://github.com/shadcn.png'
  };

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') params.delete(key);
        else params.set(key, value);
      });

      const query = params.toString();
      router.push(query ? `/store?${query}` : '/store', { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <header className="sticky md:py-3 isolate top-0 z-50 w-full bg-card/90 shadow-sm backdrop-blur-3xl dark:border-white/[0.04] shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] saturate-[180%] backdrop-saturate-[180%]">
      {/* Header Background breathing lights effect */}
      <div className="header-ambient-light" />
      {/* Header Background breathing lights effect */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* MAIN HEADER */}
      <div className="relative mx-auto flex h-16 items-center justify-between px-4 isolate">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-2">
          <SidebarToggle />
          <LogoComponent brandName={brandName} brandSlug={brandSlug} />
        </div>

        {/* DESKTOP DISCOVERY DOCK */}
        <div className="hidden items-center rounded-full border border-white/10 bg-muted/60 p-1 shadow-sm backdrop-blur-xl md:flex">
          {brands.map(item => {
            const Icon = item.icon;
            const isActive = selectedCategory === item.slug;

            return (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                onClick={() =>
                  updateQuery({
                    category: item.slug === 'all' ? null : item.slug
                  })
                }
                className={`h-9 gap-2 rounded-full px-3 text-xs transition-all ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
                }`}>
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap font-medium">{item.label}</span>
              </Button>
            );
          })}

          <PremiumStoreButton
            active={isStorePage}
            onClick={() =>
              router.push(`/store?${searchParams.toString()}`, {
                scroll: false
              })
            }
          />

          <div className="mx-2 h-6 w-px bg-border" />

          <div className="w-56 lg:w-90">
            <SearchBarComponent />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          {/* SEARCH BAR & CATEGORIES TUGGLER */}
          <div className="SearchBarTuggler">
            <button
              title="Toggle discovery tools"
              type="button"
              onClick={() => setMobileToolsOpen(prev => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-accent hover:text-accent-foreground md:hidden">
              {mobileToolsOpen ? <ChevronUp className="h-5 w-5" /> : <TextSearch className="h-5 w-5" />}
            </button>
          </div>

          {/* CART LOGICS */}
          <div className="CartLogics">
            <CartLogics />
          </div>
          {/* USER ACTION */}
          <div className="UserAction">
            <UserActionComponent
              isLoggedIn={isLoggedIn}
              user={isLoggedIn ? user : undefined}
              onLogin={() => router.push('/login')}
              onLogout={() => console.log('logout')}
            />
          </div>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DISCOVERY DOCK */}
      <div className="md:hidden">
        <div
          className={`overflow-hidden border-t border-white/10 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
            mobileToolsOpen ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="space-y-3 px-4 pb-4 pt-3">
            <MobileSearchButton />

            <StoreCategoriesPill
              selectedCategory={selectedCategory}
              onSelectCategory={category =>
                updateQuery({
                  category
                })
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
