import { ShoppingListDetail, ShoppingListProvider } from '@/features/shopping-lists';
import { resolveShoppingListWorkspace } from '@/features/shopping-lists/server/resolveShoppingListWorkspace';

type Props = {
  params: Promise<{ listId: string }>;
};

export default async function ShoppingListDetailPage({ params }: Props) {
  const { listId } = await params;
  const { workspace } = await resolveShoppingListWorkspace(`/account/lists/${listId}`);

  return (
    <ShoppingListProvider workspaceId={workspace.id}>
      <ShoppingListDetail listId={listId} />
    </ShoppingListProvider>
  );
}
