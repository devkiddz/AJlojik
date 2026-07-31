import { NextResponse } from 'next/server';

import {
  assertCartWorkspaceAccess,
  requireCartUserId
} from '@/features/cart/server/cartAuthorization';

import { CartRepository } from '@/features/cart/server/cartRepository';

import {
  CartRouteError,
  parseAddCartItemPayload,
  parseWorkspacePayload
} from '@/features/cart/server/cartValidation';

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

  console.error('Cart route failed:', error);

  return NextResponse.json(
    {
      error: 'Unable to complete the cart request.'
    },
    {
      status: 500
    }
  );
}

export async function GET(
  request: Request
) {
  try {
    const userId = await requireCartUserId();

    const url = new URL(request.url);

    const workspaceId =
      url.searchParams.get('workspaceId');

    if (!workspaceId) {
      throw new CartRouteError(
        'workspaceId is required.'
      );
    }

    await assertCartWorkspaceAccess(
      userId,
      workspaceId
    );

    const items = await CartRepository.get(
      userId,
      workspaceId
    );

    return NextResponse.json({
      items
    });
  } catch (error) {
    return handleCartRouteError(error);
  }
}

export async function POST(
  request: Request
) {
  try {
    const userId = await requireCartUserId();

    const payload = parseAddCartItemPayload(
      await request.json()
    );

    await assertCartWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result = await CartRepository.add(
      userId,
      payload.workspaceId,
      {
        productId: payload.productId,
        variantId: payload.variantId,
        quantity: payload.quantity
      }
    );

    return NextResponse.json(result, {
      status: 201
    });
  } catch (error) {
    return handleCartRouteError(error);
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const userId = await requireCartUserId();

    const payload = parseWorkspacePayload(
      await request.json()
    );

    await assertCartWorkspaceAccess(
      userId,
      payload.workspaceId
    );

    const result = await CartRepository.clear(
      userId,
      payload.workspaceId
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleCartRouteError(error);
  }
}