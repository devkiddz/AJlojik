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
  parseAddShoppingListItemPayload
} from '@/features/shopping-lists/server/shoppingListValidation';

export const runtime =
  'nodejs';

type RouteContext = {
  params: Promise<{
    listId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const {
      listId
    } = await context.params;

    const body =
      await request.json();

    const payload =
      parseAddShoppingListItemPayload(
        body
      );

    const userId =
      await requireShoppingListUserId();

    await assertShoppingListWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await ShoppingListRepository.addItem(
        userId,
        payload.workspaceId,
        listId,
        {
          productId:
            payload.productId,

          variantId:
            payload.variantId,

          quantity:
            payload.quantity,

          note:
            payload.note
        }
      );

    return NextResponse.json(
      result,
      {
        status: 201
      }
    );
  } catch (error) {
    return respondToShoppingListRouteError(
      error
    );
  }
}