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
  parseCreateShoppingListPayload,
  parseWorkspacePayload
} from '@/features/shopping-lists/server/shoppingListValidation';

export const runtime =
  'nodejs';

export async function GET(
  request: Request
) {
  try {
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

    const lists =
      await ShoppingListRepository.get(
        userId,
        payload.workspaceId
      );

    return NextResponse.json({
      lists
    });
  } catch (error) {
    return respondToShoppingListRouteError(
      error
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const payload =
      parseCreateShoppingListPayload(
        body
      );

    const userId =
      await requireShoppingListUserId();

    await assertShoppingListWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await ShoppingListRepository.create(
        userId,
        payload.workspaceId,
        {
          name:
            payload.name,

          description:
            payload.description
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