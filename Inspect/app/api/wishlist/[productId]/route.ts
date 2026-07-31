import {
  NextRequest,
  NextResponse
} from 'next/server';

import {
  requireWishlistAccess
} from '@/features/wishlist/server/wishlistAccess';

import {
  wishlistErrorResponse,
  WishlistHttpError
} from '@/features/wishlist/server/wishlistErrors';

import {
  removeProductFromWishlist
} from '@/features/wishlist/server/wishlistRepository';

type WishlistProductRouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

async function readWorkspaceId(
  request: Request
): Promise<string> {
  try {
    const body: unknown =
      await request.json();

    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body)
    ) {
      throw new Error();
    }

    const workspaceId =
      (
        body as Record<
          string,
          unknown
        >
      ).workspaceId;

    if (
      typeof workspaceId !== 'string' ||
      !workspaceId.trim()
    ) {
      throw new Error();
    }

    return workspaceId.trim();
  } catch {
    throw new WishlistHttpError(
      400,
      'workspaceId is required.'
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: WishlistProductRouteContext
) {
  try {
    const {
      productId: productIdInput
    } = await context.params;

    const productId =
      decodeURIComponent(
        productIdInput
      ).trim();

    if (!productId) {
      throw new WishlistHttpError(
        400,
        'productId is required.'
      );
    }

    const workspaceId =
      await readWorkspaceId(request);

    const access =
      await requireWishlistAccess(
        request,
        workspaceId
      );

    const productIds =
      await removeProductFromWishlist({
        ...access,
        productId
      });

    return NextResponse.json({
      productIds,
      affectedProductId: productId,
      liked: false
    });
  } catch (error) {
    return wishlistErrorResponse(error);
  }
}