# ms-e02.4 — PWA and Installed-App Experience

This package implements the controlled AJ Logik Early Access PWA.

## CREATE

- `features/pwa/pwaTypes.ts`
- `features/pwa/pwaRuntime.ts`
- `features/pwa/PWARuntimeProvider.tsx`
- `features/pwa/PWAInstallControl.tsx`
- `features/pwa/PWAGlobalStatus.tsx`
- `features/pwa/OfflineRecovery.tsx`
- `features/pwa/pwa.css`
- `features/pwa/index.ts`

## REPLACE

- `app/layout.tsx`
- `components/Navbar.tsx`
- `app/manifest.ts`
- `public/sw.js`
- `next.config.ts`
- `app/offline/page.tsx`

## Controlled release modes

The public install UI is controlled with:

```text
NEXT_PUBLIC_PWA_INSTALL_MODE
```

Allowed values:

- `off` — suppress AJ Logik’s install UI
- `beta` — show `Install Beta`
- `public` — show `Install App`

The default is `beta`, so the package is immediately ready for installed-app testing.

The service worker foundation remains enabled in production even when the install UI is off.

## Adaptive navbar control

The global customer navbar now adapts:

- Browser + install prompt available → `Install Beta` or `Install App`
- iPhone/iPad Safari → opens clear Add to Home Screen instructions
- Installed app → becomes `Share`
- Update waiting → becomes `Update`

The History control remains separate and unchanged.

## Update safety

A newly downloaded service worker does not force-refresh an active experience.

The customer receives:

- an Update-ready notice;
- a persistent navbar Update action;
- manual approval before `SKIP_WAITING`;
- reload only after the new worker becomes the controller.

## Safe cache policy

Cached:

- offline fallback;
- PWA icons;
- manifest;
- favicon;
- immutable `/_next/static/` files;
- CSS, JavaScript and local font assets.

Never promoted to offline truth by the service worker:

- API responses;
- authentication;
- prices;
- stock;
- Cart;
- Wishlist;
- Shopping Lists;
- orders;
- payments;
- checkout;
- personalized feeds;
- product images and dynamic media.

Navigation remains network-first and falls back to `/offline`.

## Installed-app refinements

- standalone display detection;
- iOS standalone detection;
- safe-area handling;
- offline status banner;
- connection-restored feedback;
- non-interruptive update notice;
- native share with clipboard fallback;
- improved offline recovery page;
- Store, Cart, Shopping Lists and Account shortcuts.

## Existing file

`components/pwa/PWARegistration.tsx` becomes unused after this package. It may be deleted after validation, but leaving it in place does not affect the build.

## Database

No Prisma migration or seed is required.
