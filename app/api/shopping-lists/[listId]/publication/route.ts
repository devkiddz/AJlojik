import { NextResponse } from 'next/server';

import {
  assertShoppingListWorkspaceAccess,
  requireShoppingListUserId
} from '@/features/shopping-lists/server/shoppingListAuthorization';
import { ShoppingListRepository } from '@/features/shopping-lists/server/shoppingListRepository';
import { respondToShoppingListRouteError } from '@/features/shopping-lists/server/shoppingListRouteResponse';
import { parseShoppingListPublicationPayload } from '@/features/shopping-lists/server/shoppingListValidation';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    listId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { listId } = await context.params;
    const body = await request.json();
    const payload = parseShoppingListPublicationPayload(body);

    const userId = await requireShoppingListUserId();

    await assertShoppingListWorkspaceAccess(userId, payload.workspaceId);

    const result =
      payload.action === 'SUBMIT'
        ? await ShoppingListRepository.submitPublication(
            userId,
            payload.workspaceId,
            listId
          )
        : await ShoppingListRepository.withdrawPublication(
            userId,
            payload.workspaceId,
            listId
          );

    return NextResponse.json(result);
  } catch (error) {
    return respondToShoppingListRouteError(error);
  }
}
