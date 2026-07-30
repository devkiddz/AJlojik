# ms-e02.4b — Premium Command Header & Navigation Reorganization

Apply after `ms-e02.3c` and `ms-e02.4`.

This package implements the approved AJ Logik navigation direction without rebuilding Search, Discovery Hub, Experience Stack, Cart, Wishlist, account, workspace or PWA engines.

## REPLACE

1. `components/Navbar.tsx`
2. `components/UserActionComponent.tsx`
3. `components/shared/LogoComponent.tsx`
4. `components/shared/SidebarToggle.tsx`
5. `components/layout/ApplicationShell.tsx`
6. `features/experience-stack/ExperienceNavigationControls.tsx`
7. `features/experience-stack/CustomerExperienceNavigationPortal.tsx`
8. `features/pwa/PWAInstallControl.tsx`
9. `features/pwa/pwa.css`

## Mobile result

```text
Navigation | App Logo | Search | Activity | Account
```

- AJ Logik words are removed from the Navbar.
- The installed application icon becomes the navigation identity.
- History leaves the mobile Navbar and renders inside the Account Sheet.
- Share is removed from the mobile Navbar.
- Install, Update and standalone Share actions live inside the Account Sheet.
- The Experience Stack Back control returns below the Navbar in the traditional top-left content position.
- The header covers the full standalone safe-area region.
- The header uses the sealed glass language of the bottom app navigation.
- Search and category engines remain unchanged.

## Desktop result

- One continuous premium glass command surface.
- App-logo identity instead of brand words.
- Clear brand, category, Search and utility zones.
- Stronger header height, shadow and visual authority.
- Desktop History remains in the command header.
- PWA Install, Update and Share controls remain available on desktop.
- Search, History and commerce behaviour remain unchanged.
- Full category command mode starts at `xl`; compact desktop/tablet keeps the clean icon header.

## Share decision

A scroll-triggered floating Share control was intentionally not introduced.

- It would add another viewport obstruction beside Discovery Hub and bottom navigation.
- Share is not meaningful on every route.
- The existing PWA runtime already knows whether system sharing is supported.
- Moving it into the Account Sheet keeps the mobile header clean without deleting the feature.

## Back policy

The restored Back button:

- uses `ExperienceStackProvider.goBack()`;
- does not use uncontrolled browser history;
- appears only when a meaningful previous experience exists;
- appears in normal document flow below the Navbar;
- is mobile/tablet only;
- does not overlap the Hero.

## Database

No Prisma migration or seed is required.
