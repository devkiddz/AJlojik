'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { UtensilsCrossed, Wine, PartyPopper, Landmark } from 'lucide-react';

import SearchBarComponent from './SearchBarComponent';
import UserActionComponent from './UserActionComponent';
import ThemeController from './ThemeController';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';
import SidebarToggle from './shared/SidebarToggle';
import { Button } from './ui/button';

type BrandType = {
  brandName: string;
  brandSlug: string;
};

const brands = [
  { id: 'Market', label: 'AJ Stores', icon: Landmark, slug: 'all' },
  { id: 'kitchen', label: 'AJ Kitchen', icon: UtensilsCrossed, slug: 'kitchen' },
  { id: 'liqz', label: 'AJ Liqz', icon: Wine, slug: 'wines' },
  { id: 'party', label: 'Party Plans', icon: PartyPopper, slug: 'party-plans' }
];

export default function NavbarComponent({ brandName, brandSlug }: BrandType) {
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category') || 'all';
  const isLoggedIn = true;
  const user = isLoggedIn
    ? {
        name: 'Dennis Okaro Jones',
        email: 'developer@ajlogiks.com',
        image: 'https://github.com/shadcn.png'
      }
    : undefined;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryChange = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('category', slug);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <header className="sticky top-0 z-50 h-14 w-full bg-background/80 backdrop-blur-xl shadow">
      <div className="relative mx-auto flex h-full items-center justify-between px-4">
        {/* LEFT */}
        <div className="flex items-center gap-1.5">
          <SidebarToggle />
          <LogoComponent brandName={brandName} brandSlug={brandSlug} />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 pt-2">
          <ThemeController />

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

        {/* CENTER */}
        <div
          className={`
            hidden md:flex
            absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            items-center rounded-full bg-muted/70
            px-2 pl-4 py-1
            transition-all duration-500 ease-in-out
            ${scrolled ? 'scale-[1.05]' : 'scale-100'}
          `}>
          {/* BRANDS */}
          <div className="flex items-center shrink-0">
            {brands.map(item => {
              const Icon = item.icon;
              const isActive = activeCategory === item.slug;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleCategoryChange(item.slug)}
                  className={`
                    flex h-8 p-2 text-xs items-center rounded-full
                    transition-all duration-300
                    ${isActive ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:text-rose-500'}
                  `}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* DIVIDER */}
          <div className="mx-3 h-6 w-px bg-border" />

          {/* SEARCH */}
          <div className="w-[300px]">
            <SearchBarComponent />
          </div>
        </div>
      </div>
    </header>
  );
}
