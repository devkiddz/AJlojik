# AJ Logik — Post-MS11 Featured Layout and Actions V4

## Presentation corrections

### Fixed featured width

At the desktop `lg` breakpoint, the featured card now remains exactly `34rem`
wide. It no longer grows or shrinks with the section.

The product rail receives the remaining width. As the viewport narrows, the
rail naturally exposes fewer cards while retaining horizontal scrolling and
the existing navigation arrows.

Below the desktop breakpoint, the section may stack so genuinely small mobile
screens are not forced into horizontal page overflow.

### Featured action density

The canonical `ProductActionTray` gains one backward-compatible presentation
option:

- Add to Cart remains a readable labelled button.
- Add to List remains an icon action.
- Wishlist remains an icon action.
- Live cart quantities, Shopping List dialogs, authenticated Wishlist state,
  Hub synchronization and mutation feedback remain canonical.

Existing ProductActionTray consumers are unchanged.

### Typography

- Featured product title changes from `font-black` to `font-semibold`.
- Short description is clamped to two lines.

## Build-cache correction

The reported build failure is inside:

```text
.next/dev/types/routes.d.ts
```

Typecheck passed before the build, and `.next` is generated output. Stop the
development server before removing the cache.

## Install and validate

Extract this ZIP into the project root:

```powershell
node .\apply.post-ms11-featured-layout-actions-v4.mjs
Remove-Item .\apply.post-ms11-featured-layout-actions-v4.mjs

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

npm run typecheck
npm run lint
npm run build
```

Do not run `eslint --fix`.

## Files updated by V4

- `features/products/cards/ProductActionTray.tsx`
- `features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx`
- `features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx`

The carousel card remains connected to the canonical action tray from V3.
No migration or dependency change is required.
