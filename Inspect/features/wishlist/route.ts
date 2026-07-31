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
  addProductToWishlist,
  listWishlistProductIds
} from '@/features/wishlist/server/wishlistRepository';

function requireString(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !== 'string' ||
    !value.trim()
  ) {
    throw new WishlistHttpError(
      400,
      `${fieldName} is required.`
    );
  }

  return value.trim();
}

async function readJsonBody(
  request: Request
): Promise<Record<string, unknown>> {
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

    return body as Record<
      string,
      unknown
    >;
  } catch {
    throw new WishlistHttpError(
      400,
      'The wishlist request body is invalid.'
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const workspaceId =
      request.nextUrl.searchParams.get(
        'workspaceId'
      );

    const access =
      await requireWishlistAccess(
        request,
        workspaceId
      );

    const productIds =
      await listWishlistProductIds(
        access
      );

    return NextResponse.json({
      productIds
    });
  } catch (error) {
    return wishlistErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await readJsonBody(request);

    const workspaceId =
      requireString(
        body.workspaceId,
        'workspaceId'
      );

    const productId =
      requireString(
        body.productId,
        'productId'
      );

    const access =
      await requireWishlistAccess(
        request,
        workspaceId
      );

    const productIds =
      await addProductToWishlist({
        ...access,
        productId
      });

    return NextResponse.json({
      productIds,
      affectedProductId: productId,
      liked: true
    });
  } catch (error) {
    return wishlistErrorResponse(error);
  }
}