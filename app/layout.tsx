import type { Metadata } from 'next';

import { Geist, Geist_Mono, Inter } from 'next/font/google';

import { Suspense, type ReactNode } from 'react';

import './globals.css';

import FooterComponent from '@/components/FooterComponent';
import NavbarComponent from '@/components/Navbar';
import MobileApplicationShell from '@/components/layout/MobileApplicationShell';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { CartProvider } from '@/features/cart';
import { CatalogProvider } from '@/features/catalog';
import SearchMobileOverlay from '@/features/search/SearchMobileOverlay';
import { WorkspaceProvider } from '@/features/workspace';

import { cn } from '@/lib/utils';

import { AppSidebar } from '@/providers/AppSideBar';
import IdentityProvider from '@/providers/IdentityProvider';
import SearchProvider from '@/providers/SearchProvider';
import ThemeProvider from '@/providers/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans'
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono'
});

export const metadata: Metadata = {
  title: 'eSupermarket - AJ Logik',
  description: 'Your personalized modular shopping workspace.'
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'font-sans antialiased',
        inter.variable,
        geistSans.variable,
        geistMono.variable
      )}>
      <body className="min-h-svh bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <IdentityProvider>
            <WorkspaceProvider>
              <CatalogProvider>
                <CartProvider>
                  <SearchProvider>
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
                  </SearchProvider>
                </CartProvider>
              </CatalogProvider>
            </WorkspaceProvider>
          </IdentityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
