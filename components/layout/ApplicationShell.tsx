import { Suspense, type ReactNode } from 'react';

import FooterComponent from '@/components/FooterComponent';
import NavbarComponent from '@/components/Navbar';

import MobileApplicationShell from '@/components/layout/MobileApplicationShell';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import SearchMobileOverlay from '@/features/search/SearchMobileOverlay';

import { AppSidebar } from '@/providers/AppSideBar';

type ApplicationShellProps = {
  children: ReactNode;
};

export default function ApplicationShell({ children }: ApplicationShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset className="min-w-0 overflow-x-hidden">
        <div className="flex min-h-svh min-w-0 flex-col">
          <header className="sticky top-0 z-50 shrink-0">
            <Suspense fallback={null}>
              <NavbarComponent brandName="AJ" brandSlug="Logik" />
            </Suspense>
          </header>

          <main className="flex min-w-0 flex-1 flex-col">
            <MobileApplicationShell>{children}</MobileApplicationShell>
          </main>

          <FooterComponent brandName="AJ" brandSlug="Logik" />
        </div>
      </SidebarInset>

      <SearchMobileOverlay />
    </SidebarProvider>
  );
}
