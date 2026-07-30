import {
  notFound
} from 'next/navigation';

import {
  PublicShoppingListExperience
} from '@/features/shopping-lists/components/PublicShoppingListExperience';

import {
  ShoppingListRepository
} from '@/features/shopping-lists/server/shoppingListRepository';

type Props = {
  params:
    Promise<{
      listId:
        string;
    }>;
};

export default async function PublicShoppingListPage({
  params
}: Props) {
  const {
    listId
  } =
    await params;

  const list =
    await ShoppingListRepository.getApprovedPublicById(
      listId
    );

  if (!list) {
    notFound();
  }

  return (
    <PublicShoppingListExperience
      list={
        list
      }
    />
  );
}
