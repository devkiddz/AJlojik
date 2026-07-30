# ms-e02.2 — UI Density and Carousel Normalization

This package reduces the application presentation by one controlled visual step while preserving the Search System and Discovery Hub control behaviour.

## REPLACE

Replace these complete files:

- `features/products/productRailPresentation.ts`
- `features/products/cards/ProductCard.tsx`
- `features/feed-experience/renderers/FeedRenderer.tsx`
- `features/customer-dashboard/layout/CustomerDashboard.tsx`
- `features/customer-dashboard/components/rail/DashboardRail.tsx`
- `features/customer-dashboard/components/journey/JourneyCardShell.tsx`
- `features/customer-dashboard/components/products/DashboardProductPreview.tsx`
- `features/customer-dashboard/components/products/ProductExperienceSection.tsx`
- `components/discovery-hub-panel/DiscoveryHubPanel.tsx`

## Results

- Store product rails use smaller stable widths on tablet, desktop, and wide screens.
- Product cards fill their carousel item instead of stopping at a conflicting 200px maximum width.
- Product rail gaps and edge padding are normalized.
- Feed module spacing is reduced from an oversized desktop jump to a controlled rhythm.
- Customer dashboard gutters, rail headers, journey cards, product previews, and footer breathing room are reduced together.
- Four customer journey cards can appear on very wide screens.
- Discovery Hub header, tabs, and content gutters are reduced without changing its navigation or active-group logic.

## Protected systems

This package does not alter:

- Search behaviour
- Discovery Hub provider logic
- Discovery Hub registry
- Hub card data wiring
- Shopping Lists
- Experience History
- Authentication
- Database schema
