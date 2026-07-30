# AJ Logik UI Normalization and PWA Report

## Customer navigation

- Reduced the AJ Logik wordmark.
- Moved the animated Aperture mark in front of the wordmark.
- Added a motion-safe pulse to the mark.
- Removed Back from the Navbar row.
- Added a compact contextual Back control that floats below the sticky Navbar and only appears when Experience Stack can restore a meaningful previous state.
- Moved Experience History beside Cart and Account as an icon-only tracker.
- Kept the Navbar as the single sticky owner on customer routes.

## Typography and scale

- Added bounded fluid application typography tokens.
- Raised legacy 8–11px text to readable minimums.
- Added a stronger Admin-specific typography floor.
- Preserved browser zoom and operating-system accessibility scaling.
- Added short-phone and wide-screen density boundaries.

## Admin layout

- Customer Navbar, customer sidebar, Discovery Hub and footer no longer wrap Admin, Vendor or Admin Login routes.
- Admin and Vendor retain their own operational shells.
- Admin content now fills the entire area remaining beside the Admin navigation.
- Existing page-level max-width wrappers are normalized by the AdminPage surface.
- Admin navigation, captions, cards, descriptions and metrics use control-panel-readable sizing.

## Dialog and tray behavior

- Dialogs and sheets now render above the sticky customer Navbar.
- Store onboarding uses dynamic viewport height and remains scrollable on short screens.
- User Action Tray retains its scrollable action body and sticky authentication/sign-out footer.

## PWA readiness

- Added App Router web manifest.
- Added 192px, 512px, maskable and Apple touch icons.
- Added production-only service worker registration.
- Added network-first public-page handling and static-asset caching.
- API requests and private customer/Admin/Vendor pages are never cached by the service worker.
- Added an offline fallback route.
- Added service-worker cache headers and root scope.
