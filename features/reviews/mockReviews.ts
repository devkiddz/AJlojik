import type {
  ExperienceReview,
  ReviewRating,
  ReviewTargetType
} from '@/features/feed-experience/contracts';

type CreateMockReviewsInput = {
  targetType: ReviewTargetType;
  targetId: string;
  targetName: string;

  averageRating: number;
  reviewCount: number;

  now?: string;
};

type ReviewTemplate = {
  title: string;
  comment: string;
};

const REVIEW_AUTHORS = [
  {
    name: 'Amara Okafor'
  },
  {
    name: 'Chinedu Eze'
  },
  {
    name: 'Grace Williams'
  },
  {
    name: 'Daniel Adeyemi'
  },
  {
    name: 'Lilian Afor'
  },
  {
    name: 'Samuel Johnson'
  },
  {
    name: 'Ifeoma Nwosu'
  },
  {
    name: 'Michael Peters'
  }
] as const;

const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    title: 'Exactly as described',
    comment:
      'The quality and presentation matched the description. The overall experience was smooth, and I would confidently choose this again.'
  },
  {
    title: 'Impressive quality',
    comment:
      'Everything arrived in good condition and the attention to detail was excellent. It felt thoughtfully prepared from start to finish.'
  },
  {
    title: 'A very good experience',
    comment:
      'The experience was straightforward and reliable. The final result met my expectations and the service was handled professionally.'
  },
  {
    title: 'Worth considering',
    comment:
      'The quality was good and the experience was generally satisfying. There are a few small areas that could be improved, but I am pleased overall.'
  },
  {
    title: 'Beautifully presented',
    comment:
      'The presentation stood out immediately. It felt premium, carefully handled and consistent with what was shown before ordering.'
  },
  {
    title: 'Would recommend',
    comment:
      'A reliable experience with good quality and clear attention to the customer. I would recommend it to someone looking for something dependable.'
  }
];

const RATING_OFFSETS = [
  0,
  0.2,
  -0.2,
  0.4,
  -0.5,
  0.1
] as const;

function createHash(value: string): number {
  return Array.from(value).reduce(
    (total, character) =>
      (total * 31 + character.charCodeAt(0)) %
      1_000_003,
    7
  );
}

function clampRating(value: number): ReviewRating {
  const rounded = Math.round(value);

  if (rounded <= 1) {
    return 1;
  }

  if (rounded >= 5) {
    return 5;
  }

  return rounded as ReviewRating;
}

function createReviewDate(
  baseDate: Date,
  index: number,
  seed: number
): string {
  const dayOffset =
    3 + ((seed + index * 11) % 120);

  const createdAt =
    new Date(baseDate);

  createdAt.setDate(
    createdAt.getDate() -
      dayOffset
  );

  return createdAt.toISOString();
}

export function createMockReviews({
  targetType,
  targetId,
  targetName,
  averageRating,
  reviewCount,
  now
}: CreateMockReviewsInput): ExperienceReview[] {
  if (reviewCount <= 0) {
    return [];
  }

  const seed =
    createHash(
      `${targetType}:${targetId}`
    );

  const baseDate =
    now && !Number.isNaN(Date.parse(now))
      ? new Date(now)
      : new Date();

  const previewCount =
    Math.min(
      4,
      reviewCount
    );

  return Array.from(
    {
      length: previewCount
    },
    (_, index) => {
      const author =
        REVIEW_AUTHORS[
          (seed + index) %
            REVIEW_AUTHORS.length
        ];

      const template =
        REVIEW_TEMPLATES[
          (seed + index * 2) %
            REVIEW_TEMPLATES.length
        ];

      const rating =
        clampRating(
          averageRating +
            RATING_OFFSETS[
              (seed + index) %
                RATING_OFFSETS.length
            ]
        );

      return {
        id:
          `review:${targetType}:${targetId}:${index + 1}`,

        targetType,
        targetId,

        author: {
          id:
            `mock-reviewer-${(seed + index) % 10_000}`,

          name:
            author.name
        },

        rating,

        title:
          template.title,

        comment:
          `${template.comment} ${targetName} matched what I expected from the experience.`,

        verified:
          index !==
          previewCount - 1,

        helpfulCount:
          2 +
          ((seed + index * 7) %
            48),

        createdAt:
          createReviewDate(
            baseDate,
            index,
            seed
          )
      };
    }
  );
}