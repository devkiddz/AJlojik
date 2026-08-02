# AJ Logik — Post-MS11 Featured Experience and Navbar History V2

This package replaces the earlier post-MS11 Navbar/Featured Experience repair.

## Navbar History

Desktop presentation now mirrors the Updates trigger:

- circular History icon;
- count badge attached to the icon;
- `History` label directly underneath;
- label remains absent from mobile Navbar;
- mobile account-sheet History remains unchanged.

## Featured Experience

The section follows the supplied composition:

- section identity and title at upper-left;
- previous/next rail controls at upper-right;
- one larger split image/details featured-product card on the left;
- compact horizontal product cards on the right;
- partial next-card exposure on mobile;
- responsive stacked layout on smaller screens.

The right-hand rail is retained intentionally. The oversized nested
`Continue exploring` panel presentation is replaced.

The available Feed contract currently supports product details, wishlist and
cart. The feature card therefore uses those real actions rather than rendering
a non-functional Shopping List button.

## Install

Ignore the earlier repair ZIP. Extract this V2 ZIP into the project root:

```powershell
node .\apply.post-ms11-featured-experience-navbar-v2.mjs
Remove-Item .\apply.post-ms11-featured-experience-navbar-v2.mjs

npm run typecheck
npm run lint
npm run build
```

## Stage after validation

```powershell
git add -- `
  "features/experience-stack/ExperienceNavigationControls.tsx" `
  "features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx" `
  "features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx" `
  "features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx"

git diff --cached --stat
git status --short

git commit -m "fix(experience): refine featured rail and navbar history"
git push origin main
```

No migration or dependency change is required.
