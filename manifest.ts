import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'AJ Logik — Premium Commerce Experience',
    short_name: 'AJ Logik',
    description: 'A discovery-led shopping workspace for products, food, drinks and premium experiences.',
    start_url: '/store',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#050814',
    theme_color: '#0b1220',
    categories: ['shopping', 'food', 'lifestyle'],
    icons: [
      {
        src: '/pwa/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/pwa/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Open Store',
        short_name: 'Store',
        description: 'Continue shopping in AJ Logik.',
        url: '/store',
        icons: [{ src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png' }]
      },
      {
        name: 'My Account',
        short_name: 'Account',
        description: 'Open your AJ Logik customer dashboard.',
        url: '/account',
        icons: [{ src: '/pwa/icon-192.png', sizes: '192x192', type: 'image/png' }]
      }
    ]
  };
}
