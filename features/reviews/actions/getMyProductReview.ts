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
      code:
        | 'INVALID_INPUT'
        | 'ACCOUNT_UNAVAILABLE'
        | 'LOAD_FAILED';
      message: string;
    };

export async function getMyProductReview(
  productIdInput: string
): Promise<GetMyProductReviewResult> {
  try {
    const productId = productIdInput.trim();

    if (!productId) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: 'A valid product is required.'
      };
    }

    const session = await auth.api.getSession({
      headers: await headers()
    });

    /*
     * Being signed out is a normal state.
     * It does not mean review loading failed.
     */
    if (!session?.user?.id) {
      return {
        ok: true,
        review: null
      };
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },

      select: {
        id: true,
        name: true,
        image: true,
        accountState: true
      }
    });

    if (!user || user.accountState !== 'ACTIVE') {
      return {
        ok: false,
        code: 'ACCOUNT_UNAVAILABLE',
        message: 'Your account is currently unavailable.'
      };
    }

    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },

      select: {
        id: true,
        productId: true,

        rating: true,
        title: true,
        comment: true,

        status: true,
        moderationReason: true,

        createdAt: true,
        updatedAt: true
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
            productId
          }
        }
      },

      select: {
        id: true
      }
    });

    const status = review.status;

    return {
      ok: true,

      review: {
        id: review.id,

        targetType: 'product',
        targetId: review.productId,

        author: {
          id: user.id,
          name: user.name,

          ...(user.image
            ? {
                avatar: user.image
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

        status,

        /*
         * Temporary compatibility with the current UI.
         */
        approved: status === 'APPROVED',

        ...(review.moderationReason
          ? {
              moderationReason: review.moderationReason
            }
          : {}),

        verified: Boolean(completedPurchase),
        helpfulCount: 0,

        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to load current user review:', error);

    return {
      ok: false,
      code: 'LOAD_FAILED',
      message: 'Your review status could not be loaded.'
    };
  }
}