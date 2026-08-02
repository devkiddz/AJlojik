# AJ Logik — Post-MS11 Navbar and Featured Experience Repair

## Corrections

### Navbar History

- Converts the desktop History icon into a labelled pill.
- Shows `History` at the `lg` desktop breakpoint.
- Keeps the mobile Navbar free of the label.
- Preserves the separate, labelled Experience History block inside the mobile
  account sheet.
- Preserves the history count, dropdown, Back, Start Fresh and Clear History.

### Featured Product Experience

- Removes the nested `Continue exploring` product slider from the
  `featured-products` fallback.
- Retains the featured product as one deliberate, centred hero story.
- Leaves `More Discoveries` and other product rails as independent Feed modules.
- Does not delete `ProductExperienceSlider.tsx`; it remains available for any
  future intentional use.
- No database change is required.

## Install

Extract this ZIP into the AJ Logik project root:

```powershell
node .\apply.post-ms11-navbar-featured-experience-repair.mjs
Remove-Item .\apply.post-ms11-navbar-featured-experience-repair.mjs

npm run typecheck
npm run lint
npm run build
```

## Stage after validation

```powershell
git add -- `
  "features/experience-stack/ExperienceNavigationControls.tsx" `
  "features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx"

git diff --cached --stat
git status --short

git commit -m "fix(experience): label history and remove nested discovery rail"
git push origin main
```
