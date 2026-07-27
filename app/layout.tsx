import type { Metadata } from 'next';

import { Geist, Geist_Mono, Inter } from 'next/font/google';

import type { ReactNode } from 'react';

import './globals.css';

import ApplicationShell from '@/components/layout/ApplicationShell';

import { ActionFeedbackProvider } from '@/features/action-feedback';

import { CartProvider } from '@/features/cart';

import { CatalogProvider } from '@/features/catalog';
import { WishlistProvider } from '@/features/wishlist';

import { WorkspaceProvider } from '@/features/workspace';

import { cn } from '@/lib/utils';

import IdentityProvider from '@/providers/IdentityProvider';
import SearchProvider from '@/providers/SearchProvider';
import ThemeProvider from '@/providers/ThemeProvider';
import { ShoppingListRuntimeProvider } from '@/features/shopping-lists';

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
            <ActionFeedbackProvider>
              <WorkspaceProvider>
                <ShoppingListRuntimeProvider>
                  <CatalogProvider>
                    <WishlistProvider>
                      <CartProvider>
                        <SearchProvider>
                          <ApplicationShell>{children}</ApplicationShell>
                        </SearchProvider>
                      </CartProvider>
                    </WishlistProvider>
                  </CatalogProvider>
                </ShoppingListRuntimeProvider>
              </WorkspaceProvider>
            </ActionFeedbackProvider>
          </IdentityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
