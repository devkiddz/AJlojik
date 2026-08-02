# AJ Logik — Final Featured Card Refinement V5

This is the final narrow UI correction.

## Changes

- Keeps the existing featured-card width and dimensions.
- Preserves image-left/details-right across all screen sizes.
- Reduces only the labelled `Add to Cart` action.
- Keeps Add to List and Wishlist as their existing icon actions.
- Preserves the canonical cart, shopping-list and wishlist runtimes.
- Does not change the carousel, Navbar, typography, description clamp,
  global scaling system, migrations or dependencies.

## Install

Extract into the AJ Logik project root:

```powershell
node .\apply.post-ms11-featured-card-final-v5.mjs
Remove-Item .\apply.post-ms11-featured-card-final-v5.mjs

npm run typecheck
npm run lint
npm run build
```

## Updated files

- `features/products/cards/ProductActionTray.tsx`
- `features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx`
