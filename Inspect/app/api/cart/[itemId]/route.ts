import { NextResponse } from 'next/server';

import {
  assertCartWorkspaceAccess,
  requireCartUserId
} from '@/features/cart/server/cartAuthorization';

import { CartRepository } from '@/features/cart/server/cartRepository';

import {
  CartRouteError,
  parseUpdateCartItemPayload,
  parseWorkspacePayload
} from '@/features/cart/server/cartValidation';

type CartItemRouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

function handleCartRouteError(error: unknown) {
  if (error instanceof CartRouteError) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: error.status
      }
    );
  }

  console.error('Cart item route failed:', error);

  return NextResponse.json(
    {
      error: 'Unable to complete the cart request.'
    },
    {
      status: 500
    }
  );
}

export async function PATCH(
  request: Request,
  context: CartItemRouteContext
) {
  try {
    const userId = await requireCartUserId();

    const { itemId } = await context.params;

    if (!itemId) {
      throw new CartRouteError(
        'The cart item ID is required.'
      );
    }

    const payload =
      parseUpdateCartItemPayload(
        await request.json()
      );

    await assertCartWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await CartRepository.update(
        userId,
        payload.workspaceId,
        {
          itemId,
          quantity: payload.quantity
        }
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleCartRouteError(error);
  }
}

export async function DELETE(
  request: Request,
  context: CartItemRouteContext
) {
  try {
    const userId = await requireCartUserId();

    const { itemId } = await context.params;

    if (!itemId) {
      throw new CartRouteError(
        'The cart item ID is required.'
      );
    }

    const payload = parseWorkspacePayload(
      await request.json()
    );

    await assertCartWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result =
      await CartRepository.remove(
        userId,
        payload.workspaceId,
        itemId
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleCartRouteError(error);
  }
}