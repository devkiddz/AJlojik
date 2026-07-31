import { Suspense } from 'react';

import { ShoppingListProvider, ShoppingListsWorkspace } from '@/features/shopping-lists';
import { resolveShoppingListWorkspace } from '@/features/shopping-lists/server/resolveShoppingListWorkspace';

export default async function ShoppingListsPage() {
  const { workspace } = await resolveShoppingListWorkspace('/account/lists');

  return (
    <ShoppingListProvider workspaceId={workspace.id}>
      <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-10"><div className="h-[36rem] animate-pulse rounded-3xl border bg-muted/40" /></main>}>
        <ShoppingListsWorkspace />
      </Suspense>
    </ShoppingListProvider>
  );
}
