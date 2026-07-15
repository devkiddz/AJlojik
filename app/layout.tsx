import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { Suspense } from 'react';

import './globals.css';

import NavbarComponent from '@/components/Navbar';
import FooterComponent from '@/components/FooterComponent';
import ThemeProvider from '@/providers/ThemeProvider';
import { AppSidebar } from '@/providers/AppSideBar';
import SearchProvider from '@/providers/SearchProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import SearchMobileOverlay from '@/features/search/SearchMobileOverlay';
import MobileApplicationShell from '@/components/layout/MobileApplicationShell';
import IdentityProvider from '@/providers/IdentityProvider';
import { WorkspaceProvider } from '@/features/workspace';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'eSupermarket - AJ Logik',
  description: 'Your personalized modular shopping workspace.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable
      )}>
      <body className="h-full bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <IdentityProvider>
            <WorkspaceProvider>
              <SidebarProvider defaultOpen={true}>
                <Suspense fallback={null}>
                  <SearchProvider>
                    <AppSidebar />

                    <main className="flex min-h-screen min-w-0 flex-col">
                      <div className="sticky top-0 z-50">
                        <Suspense fallback={null}>
                          <NavbarComponent brandName="AJ" brandSlug="Logik" />
                        </Suspense>
                      </div>

                      {/* Clean wrap of page views with mobile interface controllers */}
                      <div className="flex w-full flex-1 flex-col">
                        <MobileApplicationShell>{children}</MobileApplicationShell>
                      </div>

                      <FooterComponent brandName="AJ" brandSlug="Logik" />
                    </main>

                    <SearchMobileOverlay />
                  </SearchProvider>
                </Suspense>
              </SidebarProvider>
            </WorkspaceProvider>
          </IdentityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
