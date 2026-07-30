# Changed Files

39 implementation files are included.

## Prisma and moderation

- `app/admin/approvals/page.tsx`
- `features/admin/approvals/actions.ts`
- `features/admin/components/AdminPrimitives.tsx`
- `prisma/migrations/20260729222000_add_shopping_list_publication_workflow/migration.sql`
- `prisma/schema.prisma`

## Publication APIs and repository

- `app/api/shopping-lists/[listId]/publication/route.ts`
- `app/api/shopping-lists/[listId]/route.ts`
- `app/api/shopping-lists/public/route.ts`
- `features/shopping-lists/server/shoppingListMapper.ts`
- `features/shopping-lists/server/shoppingListRepository.ts`
- `features/shopping-lists/server/shoppingListValidation.ts`
- `features/shopping-lists/shoppingListTypes.ts`

## Customer shopping-list experience

- `features/shopping-lists/client/ShoppingListProvider.tsx`
- `features/shopping-lists/client/index.ts`
- `features/shopping-lists/client/shoppingListService.ts`
- `features/shopping-lists/components/AddToShoppingListDialog.tsx`
- `features/shopping-lists/components/PublicShoppingListRail.tsx`
- `features/shopping-lists/components/ShoppingListCard.tsx`
- `features/shopping-lists/components/ShoppingListDetail.tsx`
- `features/shopping-lists/components/ShoppingListPublicationToggle.tsx`
- `features/shopping-lists/components/ShoppingListsWorkspace.tsx`
- `features/shopping-lists/components/index.ts`

## Dashboard journeys and carousel

- `app/(account)/account/journey/[section]/page.tsx`
- `features/customer-dashboard/components/journey/CartJourneyCard.tsx`
- `features/customer-dashboard/components/journey/CustomerJourneyWorkspace.tsx`
- `features/customer-dashboard/components/journey/ExperienceJourneyRail.tsx`
- `features/customer-dashboard/components/journey/JourneyProductRows.tsx`
- `features/customer-dashboard/components/journey/JourneyRows.tsx`
- `features/customer-dashboard/components/journey/ProductJourneyCard.tsx`
- `features/customer-dashboard/components/journey/index.ts`
- `features/customer-dashboard/components/rail/useDashboardRail.ts`
- `features/customer-dashboard/components/shopping-lists/ShoppingListBanner.tsx`
- `features/customer-dashboard/components/shopping-lists/ShoppingListPreviewCard.tsx`
- `features/customer-dashboard/resolvers/resolve-customer-dashboard.ts`
- `features/customer-dashboard/view/resolveCustomerDashboardView.ts`

## Approved Store presentation

- `app/(store)/lists/[listId]/page.tsx`
- `features/feed-experience/layout/FeedExperienceWorkspace.tsx`

## UI density

- `app/globals.css`

## Other

- `features/shopping-lists/index.ts`
