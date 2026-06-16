'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Wine, PartyPopper } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import SearchBarComponent from './SearchBarComponent';
import UserActionComponent from './UserActionComponent';
import ThemeController from './ThemeController';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';

type BrandType = {
  brandName: string;
  brandSlug: string;
};

const brands = [
  {
    id: 'kitchen',
    label: 'AJ Kitchen',
    icon: UtensilsCrossed,
    href: '/?category=kitchen'
  },
  {
    id: 'liqz',
    label: 'AJ Liqz',
    icon: Wine,
    href: '/?category=wines'
  },
  {
    id: 'party',
    label: 'Party Plans',
    icon: PartyPopper,
    href: '/?category=party-plans'
  }
];

export default function NavbarComponent({ brandName, brandSlug }: BrandType) {
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl h-[72px]">
      <div className="relative mx-auto px-6">
        {/* TOP ROW */}
        <div className="flex items-center justify-between py-3">
          {/* LEFT - LOGO */}
          <LogoComponent brandName={brandName} brandSlug={brandSlug} />

          {/* RIGHT - ACTIONS */}
          <div className="flex items-center gap-3">
            <ThemeController />
            <CartLogics />
            <UserActionComponent />
          </div>
        </div>

        {/* CENTER FLOATING BAR */}
        <div
          className={`
            hidden md:flex
            absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            items-center
            rounded-full
            bg-muted
            px-3 py-2
            transition-all duration-500 ease-in-out
            origin-center
            ${scrolled ? 'scale-[1.05]' : 'scale-100'}
          `}>
          {/* BRANDS */}
          <div className="flex items-center shrink-0">
            {brands.map(brand => {
              const Icon = brand.icon;
              const category = brand.href.split('category=')[1];
              const isActive = activeCategory === category;

              return (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className={`
                    flex items-center gap-1 px-3 py-2 rounded-full
                    transition-all duration-300
                    ${isActive ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}
                  `}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{brand.label}</span>
                </Link>
              );
            })}
          </div>

          {/* DIVIDER */}
          <div className="mx-3 h-6 w-px bg-border" />

          {/* SEARCH */}
          <div className="w-[320px]">
            <SearchBarComponent />
          </div>
        </div>
      </div>
    </header>
  );
}
