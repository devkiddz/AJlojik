# Commands

## 1. Replace the files

Copy every file under `REPLACE/` to the exact matching project path.

## 2. Validate

```powershell
npm run typecheck
npm run lint
npm run build
```

## 3. Commit

```powershell
git add features/products/productRailPresentation.ts features/products/cards/ProductCard.tsx features/feed-experience/renderers/FeedRenderer.tsx features/customer-dashboard/layout/CustomerDashboard.tsx features/customer-dashboard/components/rail/DashboardRail.tsx features/customer-dashboard/components/journey/JourneyCardShell.tsx features/customer-dashboard/components/products/DashboardProductPreview.tsx features/customer-dashboard/components/products/ProductExperienceSection.tsx components/discovery-hub-panel/DiscoveryHubPanel.tsx

git commit -m "refactor: normalize UI density gutters and product rails"

git push origin main
```

No database migration or seed is required for this package.
