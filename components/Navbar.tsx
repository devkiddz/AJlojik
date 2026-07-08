'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, UtensilsCrossed, Wine, PartyPopper, TextSearch } from 'lucide-react';

import UserActionComponent from './UserActionComponent';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';
import SidebarToggle from './shared/SidebarToggle';
import { Button } from './ui/button';
import SearchBarComponent from './SearchBarComponent';
import { MobileSearchButton } from './search';
import StoreCategoriesPill from './store/StoreCategoriesPill';
import PremiumStoreButton from './ui/premium-store-button';

// ... (brands array remains the same)

type BrandType = {
  brandName: string;
  brandSlug: string;
};

// import { Landmark, LayoutGrid, PartyPopper, UtensilsCrossed, Wine } from 'lucide-react';

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
      router.push(`/store?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <header className="sticky top-0 z-[100] w-full bg-background/80 shadow-sm backdrop-blur-xl">
      {/* MAIN HEADER */}
      <div className="mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarToggle />
          <LogoComponent brandName={brandName} brandSlug={brandSlug} />
        </div>

        {/* DESKTOP CENTER DOCK */}
        <div className="hidden md:flex items-center rounded-full bg-muted/50 p-1">
          {brands.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => updateQuery({ category: item.slug === 'all' ? null : item.slug })}
              className={`h-8 gap-2 rounded-full px-3 text-xs ${selectedCategory === item.slug ? 'bg-background shadow-sm' : ''}`}>
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Button>
          ))}
          <PremiumStoreButton active={isStorePage} onClick={() => router.push(`/store`)} />
          <div className="mx-2 h-4 w-px bg-border" />
          <SearchBarComponent />
        </div>

        {/* RIGHT ACTIONS + MOBILE TRIGGER */}
        <div className="flex items-center gap-2">
          <CartLogics />
          <UserActionComponent
            isLoggedIn={isLoggedIn}
            user={user}
            onLogin={() => router.push('/login')}
            onLogout={() => console.log('logout')}
          />

          {/* MOBILE TRIGGER (Top Right) */}
          <button
            title="Nav Trigger"
            onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80">
            <TextSearch className={`h-4 w-4 transition-transform ${mobileToolsOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden border-t ${mobileToolsOpen ? 'max-h-32' : 'max-h-0'}`}>
        <div className="bg-background px-4 py-3 space-y-3">
          <MobileSearchButton />
          <StoreCategoriesPill
            selectedCategory={selectedCategory}
            onSelectCategory={category => updateQuery({ category })}
          />
        </div>
      </div>
    </header>
  );
}
