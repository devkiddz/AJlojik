import type { Metadata, Viewport } from 'next';


import type { ReactNode } from 'react';

import './globals.css';

import ApplicationShell from '@/components/layout/ApplicationShell';
import PWARegistration from '@/components/pwa/PWARegistration';

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

export const metadata: Metadata = {
  applicationName: 'AJ Logik',
  title: {
    default: 'AJ Logik — Premium Commerce Experience',
    template: '%s · AJ Logik'
  },
  description: 'Your personalized, discovery-led shopping workspace.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AJ Logik'
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/pwa/apple-touch-icon.png'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf7ef' },
    { media: '(prefers-color-scheme: dark)', color: '#050814' }
  ]
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('h-full', 'font-sans antialiased')}>
      <body className="app-ui-normalized min-h-svh bg-background text-foreground">
        <PWARegistration />
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
