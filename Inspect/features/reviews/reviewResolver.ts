import type {
  ReviewRating,
  ReviewRatingDistribution,
  ReviewsModuleDefinition,
  ReviewTargetType
} from '@/features/feed-experience/contracts';

import {
  createMockReviews
} from './mockReviews';

type ResolveReviewsInput = {
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;

  averageRating: number;
  reviewCount: number;

  locale?: string;
  now?: string;

  canWriteReview?: boolean;
};

function clampAverageRating(
  rating: number
): number {
  if (
    !Number.isFinite(rating)
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(0, rating)
  );
}

function clampReviewCount(
  reviewCount: number
): number {
  if (
    !Number.isFinite(reviewCount)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(reviewCount)
  );
}

function normalizeDistribution(
  distribution:
    ReviewRatingDistribution,
  reviewCount: number
): ReviewRatingDistribution {
  const ratings:
    ReviewRating[] = [
      5,
      4,
      3,
      2,
      1
    ];

  const currentTotal =
    ratings.reduce(
      (total, rating) =>
        total +
        distribution[rating],
      0
    );

  if (
    currentTotal ===
    reviewCount
  ) {
    return distribution;
  }

  const difference =
    reviewCount -
    currentTotal;

  return {
    ...distribution,

    5:
      Math.max(
        0,
        distribution[5] +
          difference
      )
  };
}

export function createRatingDistribution(
  averageRating: number,
  reviewCount: number
): ReviewRatingDistribution {
  const safeRating =
    clampAverageRating(
      averageRating
    );

  const safeReviewCount =
    clampReviewCount(
      reviewCount
    );

  if (
    safeReviewCount === 0
  ) {
    return {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
  }

  const ratingStrength =
    safeRating / 5;

  const fiveStarShare =
    Math.min(
      0.86,
      Math.max(
        0.18,
        ratingStrength *
          ratingStrength
      )
    );

  const fourStarShare =
    Math.min(
      0.42,
      Math.max(
        0.08,
        ratingStrength *
          (1 - ratingStrength) *
          1.7
      )
    );

  const remainingShare =
    Math.max(
      0,
      1 -
        fiveStarShare -
        fourStarShare
    );

  const distribution:
    ReviewRatingDistribution = {
      5:
        Math.round(
          safeReviewCount *
            fiveStarShare
        ),

      4:
        Math.round(
          safeReviewCount *
            fourStarShare
        ),

      3:
        Math.round(
          safeReviewCount *
            remainingShare *
            0.55
        ),

      2:
        Math.round(
          safeReviewCount *
            remainingShare *
            0.28
        ),

      1:
        Math.round(
          safeReviewCount *
            remainingShare *
            0.17
        )
    };

  return normalizeDistribution(
    distribution,
    safeReviewCount
  );
}

export function resolveReviewsModuleData({
  targetType,
  targetId,
  targetName,
  averageRating,
  reviewCount,
  locale = 'en-NG',
  now,
  canWriteReview = true
}: ResolveReviewsInput): ReviewsModuleDefinition['data'] {
  const safeAverageRating =
    clampAverageRating(
      averageRating
    );

  const safeReviewCount =
    clampReviewCount(
      reviewCount
    );

  return {
    targetType,
    targetId,
    targetName,

    title:
      'Customer Reviews',

    subtitle:
      `See what customers experienced with ${targetName}.`,

    averageRating:
      safeAverageRating,

    reviewCount:
      safeReviewCount,

    ratingDistribution:
      createRatingDistribution(
        safeAverageRating,
        safeReviewCount
      ),

    reviews:
      createMockReviews({
        targetType,
        targetId,
        targetName,

        averageRating:
          safeAverageRating,

        reviewCount:
          safeReviewCount,

        now
      }),

    locale,

    canWriteReview
  };
}