import Link from 'next/link';
import { Aperture, HeartPlus, Home, ShoppingCart, User } from 'lucide-react';
import SearchBarComponent from './SearchBarComponent';
import UserActionComponent from './UserActionComponent';
import ThemeController from './ThemeController';
import LogoComponent from './shared/LogoComponent';
import { CartLogics } from './shared/CartLogics';

type BrandType = {
  brandName: string;
  brandSlug: string;
};

export default function NavbarComponent({ brandName, brandSlug }: BrandType) {
  const navbarData = {
    //brand: [{ brandName: 'AJ', brandSlug: 'Lojik' }],
    links: [
      { name: 'Home', href: '/' },
      { name: 'Shop', href: '/shop' }
    ],
    actions: [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Cart', href: '/cart', icon: ShoppingCart },
      { name: 'Account', href: '/account', icon: User }
    ]
  };

  return (
    <header className="flex items-center px-2 md:px-4 py-2 w-full sticky top-0 bg-primary-foreground/80 z-9999 backdrop-blur-lg shadow-lg overflow-hidden">
      <nav className="flex space-x-4 justify-between px-2 md:px-4 w-full mx-auto">
        <div className="flex items-center space-x-4">
          <div className="text-sm flex items-center space-x-1">
            {/* <Link className="flex items-baseline gap-1" href="/">
              <h1 className="text-rose-500 text-xl font-bold">AJ</h1>{' '}
              <span className="font-light tracking-tight">Concepts</span>
              <Aperture className="text-rose-500 w-2 h-2" />
            </Link> */}
            <LogoComponent brandName="AJ" brandSlug="Lojik" />
          </div>
          {navbarData.links.map(link => (
            <Link key={link.name} href={link.href} className="hidden md:flex">
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 bg-primary-foreground/50 shadow-sm py-2 px-4 rounded-full">
          <SearchBarComponent />
          {/* {navbarData.actions.map(action => (
            <Link className="text-rose-500" key={action.name} href={action.href}>
              <action.icon className="h-6 w-6" />
            </Link>
          ))} */}

          <div className="actions flex items-center gap-2">
            <span className="">
              {/* THEME CONTROLLER */}
              <ThemeController />
            </span>

            <div className="flex relative">
              {/* <ShoppingCart className="w-5 h-5" /> */}
              <CartLogics />
            </div>
            <span>
              <UserActionComponent />
            </span>
          </div>
          {/* <AsideChategories className="hidden" /> */}
        </div>
      </nav>
    </header>
  );
}
