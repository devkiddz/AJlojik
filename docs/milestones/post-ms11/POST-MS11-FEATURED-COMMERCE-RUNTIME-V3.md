# AJ Logik — Post-MS11 Featured Commerce Runtime V3

This package corrects the remaining Featured Experience commerce defects.

## Root-cause findings

### Variant display

`useProductVariant` already resolves the correct variant. Product Studio also
validates and persists its label correctly.

The visible UUID came from the Base UI Select presentation: the controlled
variant ID was rendered as the trigger value. The featured card now renders the
resolved `selectedVariant.label` explicitly while continuing to submit and
change by variant ID.

### Product actions

The V2 cards duplicated older product actions and therefore bypassed the
canonical customer-commerce runtime.

Both Featured Experience cards now use `ProductActionTray`, which provides:

- live Add to Cart and quantity controls;
- Add to Shopping List dialog;
- authenticated Wishlist state and mutation;
- cart/wishlist provider synchronization used by the Discovery Hub;
- loading, stock-limit and unavailable states.

## Scope

Updated only:

- `features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx`
- `features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx`

The Navbar and Featured Experience section composition are not changed.

## Install

Extract into the AJ Logik project root:

```powershell
node .\apply.post-ms11-featured-commerce-runtime-v3.mjs
Remove-Item .\apply.post-ms11-featured-commerce-runtime-v3.mjs

npm run typecheck
npm run lint
npm run build
```

Do not rerun the earlier V2 installer.

## Stage after validation

The final UI repair remains uncommitted, so stage its complete corrected set:

```powershell
git add -- `
  "features/experience-stack/ExperienceNavigationControls.tsx" `
  "features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx" `
  "features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx" `
  "features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx"

git diff --cached --stat
git status --short

git commit -m "fix(experience): refine featured commerce and navbar history"
git push origin main
```

No migration or dependency change is required.
