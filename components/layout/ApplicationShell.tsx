'use client';

import { Suspense, type ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import FooterComponent from '@/components/FooterComponent';
import NavbarComponent from '@/components/Navbar';
import MobileApplicationShell from '@/components/layout/MobileApplicationShell';

import { SidebarInset } from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';

import { AppSidebar } from '@/providers/AppSideBar';

type ApplicationShellProps = {
  children: ReactNode;
};

export default function ApplicationShell({ children }: ApplicationShellProps) {
  const pathname = usePathname();

  const isHomeRoute = pathname === '/';

  return (
    <>
      <AppSidebar />

      <SidebarInset
        className={cn(
          'min-w-0 overflow-x-hidden',

          isHomeRoute && 'h-svh overflow-hidden'
        )}>
        <div
          className={cn(
            'flex min-w-0 flex-col',

            isHomeRoute ? 'h-svh overflow-hidden' : 'min-h-svh'
          )}>
          <header className="sticky top-0 z-50 shrink-0">
            <Suspense fallback={null}>
              <NavbarComponent brandName="AJ" brandSlug="Logik" />
            </Suspense>
          </header>

          <main
            className={cn(
              'flex min-w-0 flex-1 flex-col',

              isHomeRoute && 'min-h-0 overflow-hidden'
            )}>
            {isHomeRoute ? children : <MobileApplicationShell>{children}</MobileApplicationShell>}
          </main>

          {!isHomeRoute ? <FooterComponent brandName="AJ" brandSlug="Logik" /> : null}
        </div>
      </SidebarInset>
    </>
  );
}
