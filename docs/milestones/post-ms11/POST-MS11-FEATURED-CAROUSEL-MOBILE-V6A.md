# AJ Logik — Featured Carousel Mobile Density V6A

This is a mobile-only correction.

## Change

The product cards beside the featured card now use `46%` of the rail width on
mobile instead of `62%`.

This allows approximately two cards to remain visible, with natural horizontal
scrolling for the rest.

## Preserved

- Tablet card width: unchanged.
- Desktop card width: unchanged.
- Featured product card: unchanged.
- Product actions: unchanged.
- Navbar: unchanged.
- Global scaling system: unchanged.

## Install

```powershell
node .\apply.post-ms11-featured-carousel-mobile-v6a.mjs
Remove-Item .\apply.post-ms11-featured-carousel-mobile-v6a.mjs

npm run typecheck
npm run lint
npm run build
```

## Updated file

- `features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx`
