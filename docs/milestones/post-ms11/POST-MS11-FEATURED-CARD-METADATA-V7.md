# AJ Logik — Featured Carousel Card Metadata V7

This correction changes only the internal content alignment of the carousel
cards beside the featured product.

## Metadata layout

Each card now presents:

```text
★ 4.8 · 92 reviews
₦110,000 · 75cl
7 available
```

## Actions

Cart, Add to List and Wishlist remain connected to the canonical
`ProductActionTray`, but their row now begins from the left edge.

## Consistency

- Footer receives a consistent minimum height so neighboring actions align.
- Mobile and desktop use the same information order.
- Existing mobile, tablet and desktop card widths remain unchanged.
- Featured card, Navbar and section layout remain unchanged.

## Install

```powershell
node .\apply.post-ms11-featured-card-metadata-v7.mjs
Remove-Item .\apply.post-ms11-featured-card-metadata-v7.mjs

npm run typecheck
npm run lint
npm run build
```

## Updated file

- `features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx`
