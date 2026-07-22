'use server';

import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type UpsertProductReviewInput = {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
};

export type SavedProductReview = {
  id: string;

  targetType: 'product';
  targetId: string;

  author: {
    id: string;
    name: string;
    avatar?: string;
  };

  rating: 1 | 2 | 3 | 4 | 5;

  title?: string;
  comment: string;

  verified: boolean;
  approved: boolean;

  helpfulCount: number;

  createdAt: string;
  updatedAt: string;
};

export type UpsertProductReviewResult =
  | {
      ok: true;
      review: SavedProductReview;
      message: string;
    }
  | {
      ok: false;
      code:
        | 'UNAUTHENTICATED'
        | 'ACCOUNT_UNAVAILABLE'
        | 'INVALID_INPUT'
        | 'PRODUCT_NOT_FOUND'
        | 'SUBMISSION_FAILED';
      message: string;
    };

function normalizeTitle(value?: string): string | null {
  const title = value?.trim();

  return title ? title.slice(0, 90) : null;
}

export async function upsertProductReview(
  input: UpsertProductReviewInput
): Promise<UpsertProductReviewResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return {
        ok: false,
        code: 'UNAUTHENTICATED',
        message: 'Please sign in before submitting your review.'
      };
    }

    const productId = input.productId.trim();
    const comment = input.comment.trim();
    const rating = input.rating;

    if (!productId) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: 'A valid product is required.'
      };
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message: 'Select a rating between 1 and 5 stars.'
      };
    }

    if (comment.length < 10) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message:
          'Please write at least 10 characters about your experience.'
      };
    }

    if (comment.length > 1200) {
      return {
        ok: false,
        code: 'INVALID_INPUT',
        message:
          'Your review must not exceed 1,200 characters.'
      };
    }

    const userId = session.user.id;

    const [user, product, completedPurchase] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          name: true,
          image: true,
          accountState: true
        }
      }),

      prisma.product.findUnique({
        where: {
          id: productId
        },
        select: {
          id: true
        }
      }),

      prisma.order.findFirst({
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
      })
    ]);

    if (!user) {
      return {
        ok: false,
        code: 'UNAUTHENTICATED',
        message: 'Your account could not be resolved.'
      };
    }

    if (user.accountState !== 'ACTIVE') {
      return {
        ok: false,
        code: 'ACCOUNT_UNAVAILABLE',
        message:
          'This account is currently unable to submit reviews.'
      };
    }

    if (!product) {
      return {
        ok: false,
        code: 'PRODUCT_NOT_FOUND',
        message: 'The selected product could not be found.'
      };
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },

      create: {
        userId,
        productId,
        rating,
        title: normalizeTitle(input.title),
        comment,
        approved: false
      },

      update: {
        rating,
        title: normalizeTitle(input.title),
        comment,

        /*
         * Editing an existing review returns it to moderation.
         */
        approved: false
      },

      select: {
        id: true,
        productId: true,
        rating: true,
        title: true,
        comment: true,
        approved: true,
        createdAt: true,
        updatedAt: true
      }
    });

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

        comment: review.comment ?? comment,

        verified: Boolean(completedPurchase),
        approved: review.approved,

        helpfulCount: 0,

        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString()
      },

      message: review.approved
        ? 'Your review has been saved.'
        : 'Your review has been saved and is awaiting approval.'
    };
  } catch (error) {
    console.error('Failed to save product review:', error);

    return {
      ok: false,
      code: 'SUBMISSION_FAILED',
      message:
        'Your review could not be saved. Please try again.'
    };
  }
}