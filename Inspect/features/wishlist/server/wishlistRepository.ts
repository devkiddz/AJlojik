import 'server-only';

import {
  prisma
} from '@/lib/prisma';

import {
  WishlistHttpError
} from './wishlistErrors';

type WishlistOwner = {
  userId: string;
  workspaceId: string;
};

async function requireProduct(
  productId: string
): Promise<void> {
  const product =
    await prisma.product.findFirst({
      where: {
        id: productId,
        active: true
      },

      select: {
        id: true
      }
    });

  if (!product) {
    throw new WishlistHttpError(
      404,
      'This product is no longer available.'
    );
  }
}

async function getOrCreateWishlist({
  userId,
  workspaceId
}: WishlistOwner) {
  return prisma.wishlist.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId
      }
    },

    update: {},

    create: {
      workspaceId,
      userId
    },

    select: {
      id: true
    }
  });
}

export async function listWishlistProductIds({
  userId,
  workspaceId
}: WishlistOwner): Promise<string[]> {
  const wishlist =
    await prisma.wishlist.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      },

      select: {
        items: {
          orderBy: {
            createdAt: 'desc'
          },

          select: {
            productId: true
          }
        }
      }
    });

  return (
    wishlist?.items.map(
      item => item.productId
    ) ?? []
  );
}

export async function addProductToWishlist({
  userId,
  workspaceId,
  productId
}: WishlistOwner & {
  productId: string;
}): Promise<string[]> {
  await requireProduct(productId);

  const wishlist =
    await getOrCreateWishlist({
      userId,
      workspaceId
    });

  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId
      }
    },

    update: {},

    create: {
      wishlistId: wishlist.id,
      productId
    }
  });

  return listWishlistProductIds({
    userId,
    workspaceId
  });
}

export async function removeProductFromWishlist({
  userId,
  workspaceId,
  productId
}: WishlistOwner & {
  productId: string;
}): Promise<string[]> {
  const wishlist =
    await prisma.wishlist.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      },

      select: {
        id: true
      }
    });

  if (!wishlist) {
    return [];
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
      productId
    }
  });

  return listWishlistProductIds({
    userId,
    workspaceId
  });
}
