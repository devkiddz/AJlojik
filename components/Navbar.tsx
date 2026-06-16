'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Wine, PartyPopper } from 'lucide-react';
import { usePathname } from 'next/navigation';

import SearchBarComponent from './SearchBarComponent';
import UserActionComponent from './UserActionComponent';
import ThemeController from './ThemeController';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';
import { SidebarTrigger } from './ui/sidebar';

type BrandType = {
  brandName: string;
  brandSlug: string;
};

const brands = [
  {
    id: 'kitchen',
    label: 'AJ Kitchen',
    icon: UtensilsCrossed,
    href: '/shop/kitchen'
  },
  {
    id: 'liqz',
    label: 'AJ Liqz',
    icon: Wine,
    href: '/shop/wines'
  },
  {
    id: 'party',
    label: 'Party Plans',
    icon: PartyPopper,
    href: '/shop/party-plans'
  }
];

export default function NavbarComponent({ brandName, brandSlug }: BrandType) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl h-20">
      <div className="relative mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <SidebarTrigger className="hover:bg-muted rounded-md transition" />
          {/* LEFT - LOGO */}
          <LogoComponent brandName={brandName} brandSlug={brandSlug} />
        </div>

        {/* RIGHT - ACTIONS */}
        <div className="flex items-center gap-3">
          <ThemeController />
          <CartLogics />
          <UserActionComponent />
        </div>

        {/* CENTER BAR */}
        <div
          className={`
            hidden md:flex
            absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            items-center
            rounded-full bg-muted
            px-3 pl-6
            transition-all duration-500 ease-in-out
            origin-center
            ${scrolled ? 'scale-[1.05]' : 'scale-100'}
          `}>
          {/* BRANDS */}
          <div className="flex items-center shrink-0">
            {brands.map(item => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full transition-all duration-300
                    ${isActive ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:text-rose-500'}
                  `}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
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
