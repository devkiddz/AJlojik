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
  parseUpdateShoppingListPayload,
  parseWorkspacePayload
} from '@/features/shopping-lists/server/shoppingListValidation';

export const runtime =
  'nodejs';

type RouteContext = {
  params: Promise<{
    listId: string;
  }>;
};

export async function PATCH(
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
      parseUpdateShoppingListPayload(
        body
      );

    const userId =
      await requireShoppingListUserId();

    await assertShoppingListWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await ShoppingListRepository.update(
        userId,
        payload.workspaceId,
        listId,
        {
          name:
            payload.name,

          description:
            payload.description,

          visibility:
            payload.visibility,

          status:
            payload.status
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
      listId
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
      await ShoppingListRepository.update(
        userId,
        payload.workspaceId,
        listId,
        {
          status:
            'ARCHIVED'
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