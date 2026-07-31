import {
  NextResponse
} from 'next/server';

import {
  assertShoppingListWorkspaceAccess,
  requireShoppingListUserId
} from '@/features/shopping-lists/server/shoppingListAuthorization';

import {
  ShoppingListRepository
} from '@/features/shopping-lists/server/shoppingListRepository';

import {
  respondToShoppingListRouteError
} from '@/features/shopping-lists/server/shoppingListRouteResponse';

import {
  parseUpdateShoppingListItemPayload,
  parseWorkspacePayload
} from '@/features/shopping-lists/server/shoppingListValidation';

export const runtime =
  'nodejs';

type RouteContext = {
  params: Promise<{
    listId: string;
    itemId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const {
      listId,
      itemId
    } = await context.params;

    const body =
      await request.json();

    const payload =
      parseUpdateShoppingListItemPayload(
        body
      );

    const userId =
      await requireShoppingListUserId();

    await assertShoppingListWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await ShoppingListRepository.updateItem(
        userId,
        payload.workspaceId,
        listId,
        itemId,
        {
          quantity:
            payload.quantity,

          note:
            payload.note,

          position:
            payload.position
        }
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    return respondToShoppingListRouteError(
      error
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const {
      listId,
      itemId
    } = await context.params;

    const url =
      new URL(
        request.url
      );

    const payload =
      parseWorkspacePayload({
        workspaceId:
          url.searchParams.get(
            'workspaceId'
          )
      });

    const userId =
      await requireShoppingListUserId();

    await assertShoppingListWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await ShoppingListRepository.removeItem(
        userId,
        payload.workspaceId,
        listId,
        itemId
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    return respondToShoppingListRouteError(
      error
    );
  }
}