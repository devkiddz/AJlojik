'use client';

import { useCallback, useState } from 'react';
import { ChevronUp, LayoutGrid, PartyPopper, TextSearch, UtensilsCrossed, Wine } from 'lucide-react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import AuthIdentityMenu from '@/components/auth/AuthIdentityMenu';
import SearchBarComponent from '@/components/SearchBarComponent';
import LogoComponent from '@/components/shared/LogoComponent';
import SidebarToggle from '@/components/shared/SidebarToggle';
import StoreCategoriesPill from '@/components/store/StoreCategoriesPill';
import { Button } from '@/components/ui/button';
import PremiumStoreButton from '@/components/ui/premium-store-button';
import { MobileSearchButton } from '@/features/search';

import { CartLogics } from './shared/CartLogics';

type BrandType = {
  brandName: string;
  brandSlug: string;
};

const brands = [
  {
    id: 'all',
    label: 'All',
    icon: LayoutGrid,
    slug: 'all'
  },
  {
    id: 'kitchen',
    label: 'AJ Kitchen',
    icon: UtensilsCrossed,
    slug: 'kitchen'
  },
  {
    id: 'liqz',
    label: 'AJ Liqz',
    icon: Wine,
    slug: 'wines'
  },
  {
    id: 'party',
    label: 'Party Plans',
    icon: PartyPopper,
    slug: 'party-plans'
  }
] as const;

export default function NavbarComponent({ brandName, brandSlug }: BrandType) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const selectedCategory = searchParams.get('category') ?? 'all';

  const isStorePage = pathname === '/store' || pathname.startsWith('/store/');

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          params.delete(key);
          return;
        }

        params.set(key, value);
      });

      const query = params.toString();

      router.push(query ? `/store?${query}` : '/store', {
        scroll: false
      });
    },
    [router, searchParams]
  );

  const openStore = useCallback(() => {
    const query = searchParams.toString();

    router.push(query ? `/store?${query}` : '/store', {
      scroll: false
    });
  }, [router, searchParams]);

  return (
    <header className="sticky top-0 isolate z-50 w-full bg-card/90 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-3xl backdrop-saturate-[180%] md:py-3">
      {/* Ambient header treatment */}
      <div className="header-ambient-light" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      {/* Main desktop/mobile header */}
      <div className="relative isolate mx-auto flex h-16 items-center justify-between gap-3 px-4">
        {/* Left identity */}
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <SidebarToggle />

          <LogoComponent brandName={brandName} brandSlug={brandSlug} />
        </div>

        {/* Desktop discovery dock */}
        <div className="hidden min-w-0 items-center rounded-full border border-white/10 bg-muted/60 p-1 shadow-sm backdrop-blur-xl md:flex">
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
                className={
                  isActive
                    ? 'h-9 gap-2 rounded-full bg-accent px-3 text-xs text-accent-foreground shadow-sm transition-all'
                    : 'h-9 gap-2 rounded-full px-3 text-xs text-muted-foreground transition-all hover:bg-background/70 hover:text-foreground'
                }>
                <Icon className="size-4" />

                <span className="whitespace-nowrap font-medium">{item.label}</span>
              </Button>
            );
          })}

          <PremiumStoreButton active={isStorePage} onClick={openStore} />

          <div className="mx-2 h-6 w-px bg-border" />

          <div className="w-56 lg:w-90">
            <SearchBarComponent />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mobile discovery tools toggle */}
          <button
            type="button"
            title="Toggle discovery tools"
            aria-expanded={mobileToolsOpen}
            aria-controls="mobile-discovery-tools"
            onClick={() => setMobileToolsOpen(current => !current)}
            className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-accent hover:text-accent-foreground md:hidden">
            {mobileToolsOpen ? <ChevronUp className="size-5" /> : <TextSearch className="size-5" />}
          </button>

          {/* Commerce status */}
          <CartLogics />

          {/* Real Better Auth identity */}
          <AuthIdentityMenu />
        </div>
      </div>

      {/* Mobile collapsible discovery dock */}
      <div id="mobile-discovery-tools" className="md:hidden">
        <div
          className={
            mobileToolsOpen
              ? 'max-h-56 overflow-hidden border-t border-white/10 bg-background/95 opacity-100 backdrop-blur-xl transition-all duration-300 ease-in-out'
              : 'max-h-0 overflow-hidden border-t border-transparent bg-background/95 opacity-0 backdrop-blur-xl transition-all duration-300 ease-in-out'
          }>
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
