'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { LayoutGrid, UtensilsCrossed, Wine, PartyPopper, Landmark } from 'lucide-react';

// import SearchBarComponent from './SearchBarComponentBackup';
import UserActionComponent from './UserActionComponent';
import ThemeController from './ThemeController';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';
import SidebarToggle from './shared/SidebarToggle';

import { Button } from './ui/button';
import SearchBarComponent from './SearchBarComponent';
import { MobileSearchButton } from './search';
import StoreCategoriesPill from './store/StoreCategoriesPill';

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
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category') ?? 'all';
  const searchQuery = searchParams.get('q') ?? '';

  const isStorePage = pathname.startsWith('/store');

  const isLoggedIn = true;

  const user = isLoggedIn
    ? {
        name: 'Dennis Okaro Jones',
        email: 'developer@ajlogiks.com',
        image: 'https://github.com/shadcn.png'
      }
    : undefined;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`, {
        scroll: false
      });
    },
    [pathname, router, searchParams]
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 shadow backdrop-blur-xl">
      {/* TOP BAR */}
      <div className="relative z-55 mx-auto flex h-14 items-center justify-between px-4">
        {/* LEFT */}
        <div className="flex items-center gap-1.5">
          <SidebarToggle />
          <LogoComponent brandName={brandName} brandSlug={brandSlug} />
        </div>

        {/* DESKTOP CENTER */}
        <div
          className={`
        absolute left-1/2 top-1/2 z-55
        hidden -translate-x-1/2 -translate-y-1/2
        items-center rounded-full
        bg-muted/70
        px-2 py-1 pl-4
        transition-all duration-500 ease-in-out
        md:flex
        ${scrolled ? 'scale-[1.05]' : 'scale-100'}
      `}>
          {/* BRANDS */}
          {brands.map(item => {
            const Icon = item.icon;

            const isActive = selectedCategory === item.slug;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() =>
                  updateQuery({
                    category: item.slug === 'all' ? null : item.slug
                  })
                }
                className={`
              flex h-8 items-center gap-2 rounded-full px-3
              text-xs transition-all duration-300
              ${isActive ? 'bg-secondary/10 text-secondary' : 'text-muted-foreground hover:text-secondary'}
            `}>
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap font-medium">{item.label}</span>
              </Button>
            );
          })}

          {/* STORE */}
          <Button
            variant="ghost"
            onClick={() =>
              router.push(`/store?${searchParams.toString()}`, {
                scroll: false
              })
            }
            className={`
          flex h-8 items-center gap-2 rounded-full px-3
          text-xs font-medium transition-all duration-300
          ${
            isStorePage
              ? 'bg-gradient-royal text-primary hover:text-secondary'
              : 'text-muted-foreground hover:text-secondary'
          }
        `}>
            <Landmark className="h-4 w-4" />
            AJ Store
          </Button>

          <div className="mx-3 h-6 w-px bg-border" />

          <div className="w-[320px] xl:w-[360px]">
            <SearchBarComponent />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <CartLogics />

              <UserActionComponent
                isLoggedIn={isLoggedIn}
                user={user}
                onLogin={() => router.push('/login')}
                onLogout={() => console.log('logout')}
              />
            </>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="border-t bg-background px-4 py-3 md:hidden">
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
    </header>
  );
}
