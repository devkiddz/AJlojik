# ms-e02.4 Test Checklist

## Manifest and icons

- [ ] `/manifest.webmanifest` returns 200.
- [ ] Manifest name is AJ Logik.
- [ ] Start URL opens `/store?source=pwa`.
- [ ] 192px, 512px, maskable and Apple icons load.
- [ ] Browser application panel reports the manifest as valid.
- [ ] Store, Cart, Shopping Lists and Account shortcuts appear where supported.

## Installation control

- [ ] Production browser shows `Install Beta` when an install prompt is available.
- [ ] Mobile layout shows the compact Install icon without overflow.
- [ ] The History tracker remains visible and separate.
- [ ] Accepting installation removes the install action.
- [ ] Installed mode changes the navbar action to Share.
- [ ] `NEXT_PUBLIC_PWA_INSTALL_MODE=off` suppresses AJ Logik’s install UI.
- [ ] `NEXT_PUBLIC_PWA_INSTALL_MODE=public` changes the label to Install App.

## iPhone and iPad

- [ ] Safari shows the AJ Logik install control.
- [ ] Tapping it opens Share → Add to Home Screen instructions.
- [ ] Installed launch uses the standalone display.
- [ ] The navbar respects the top safe area.
- [ ] Bottom notices respect the home-indicator safe area.

## Service worker

- [ ] `/sw.js` returns JavaScript with no-store headers.
- [ ] The worker registers only in a production build.
- [ ] Development unregisters existing AJ Logik workers.
- [ ] API requests are not intercepted.
- [ ] `/_next/static/` assets are cached.
- [ ] Product images are not stored by the worker.
- [ ] Dynamic navigation remains network-first.
- [ ] Offline navigation reaches `/offline`.

## Update flow

- [ ] Deploy version A and install/open it.
- [ ] Deploy version B with a changed `VERSION` in `public/sw.js`.
- [ ] Existing app does not refresh automatically.
- [ ] Update-ready notice appears.
- [ ] Navbar action becomes Update.
- [ ] Dismissing the notice leaves the navbar Update action available.
- [ ] Tapping Update activates the waiting worker and reloads once.

## Connectivity

- [ ] Going offline shows the global offline banner.
- [ ] Banner explains that live commerce data is unavailable.
- [ ] Going online shows connection-restored feedback.
- [ ] Offline page does not claim cached price, stock, Cart or order truth.
- [ ] Try again becomes useful once the network returns.

## Share

- [ ] Installed app shows Share in the navbar.
- [ ] Native share opens where supported.
- [ ] Clipboard fallback copies the current route.
- [ ] Cancelling native share does not show an error.

## Regression

- [ ] Customer Store loads normally.
- [ ] Search remains unchanged.
- [ ] History remains unchanged.
- [ ] Cart, Wishlist and Shopping Lists remain live.
- [ ] Admin and Vendor operational shells remain unaffected.
- [ ] No horizontal navbar overflow is introduced.
- [ ] `npm run typecheck`, `npm run lint` and `npm run build` pass.
