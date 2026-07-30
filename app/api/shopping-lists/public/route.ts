import { NextResponse } from 'next/server';

import { ShoppingListRepository } from '@/features/shopping-lists/server/shoppingListRepository';
import { ShoppingListRouteError } from '@/features/shopping-lists/server/shoppingListValidation';
import { respondToShoppingListRouteError } from '@/features/shopping-lists/server/shoppingListRouteResponse';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get('workspaceId')?.trim();

    if (!workspaceId) {
      throw new ShoppingListRouteError('workspaceId is required.');
    }

    const lists = await ShoppingListRepository.getApprovedPublic(workspaceId, 12);

    return NextResponse.json({ lists });
  } catch (error) {
    return respondToShoppingListRouteError(error);
  }
}
