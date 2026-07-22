'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import type { SavedProductReview } from './upsertProductReview';

export type GetMyProductReviewResult =
  | {
      ok: true;
      review: SavedProductReview | null;
    }
  | {
      ok: false;
      message: string;
    };

export async function getMyProductReview(
  productId: string
): Promise<GetMyProductReviewResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return {
        ok: true,
        review: null
      };
    }

    const normalizedProductId = productId.trim();

    if (!normalizedProductId) {
      return {
        ok: false,
        message: 'A valid product is required.'
      };
    }

    const userId = session.user.id;

    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: normalizedProductId
        }
      },

      select: {
        id: true,
        productId: true,
        rating: true,
        title: true,
        comment: true,
        approved: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!review) {
      return {
        ok: true,
        review: null
      };
    }

    const completedPurchase = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        paymentStatus: 'PAID',

        items: {
          some: {
            productId: normalizedProductId
          }
        }
      },

      select: {
        id: true
      }
    });

    return {
      ok: true,

      review: {
        id: review.id,

        targetType: 'product',
        targetId: review.productId,

        author: {
          id: review.user.id,
          name: review.user.name,

          ...(review.user.image
            ? {
                avatar: review.user.image
              }
            : {})
        },

        rating: review.rating as 1 | 2 | 3 | 4 | 5,

        ...(review.title
          ? {
              title: review.title
            }
          : {}),

        comment: review.comment ?? '',

        verified: Boolean(completedPurchase),
        approved: review.approved,

        helpfulCount: 0,

        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to load customer review:', error);

    return {
      ok: false,
      message: 'Your review status could not be loaded.'
    };
  }
}