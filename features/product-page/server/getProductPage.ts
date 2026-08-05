import 'server-only';

/* AJ_PRODUCT_PAGE_EXPERIENCE_V1 */

import {
  cache
} from 'react';

import type {
  ExperienceReview,
  ReviewRating,
  ReviewRatingDistribution,
  ReviewsModuleDefinition
} from '@/features/feed-experience/contracts';

import {
  getCatalog,
  getCatalogCategories,
  resolveCatalogWorkspace
} from '@/features/catalog/services/get-catalog';

import {
  resolveProductRelationships
} from '@/features/products/resolution';

import {
  prisma
} from '@/lib/prisma';

import type {
  ProductPageData
} from '../contracts';

function normalizeSlug(
  value: string
): string {
  let decoded = value;

  try {
    decoded =
      decodeURIComponent(
        value
      );
  } catch {
    decoded = value;
  }

  return decoded
    .trim()
    .toLowerCase();
}

function toReviewRating(
  value: number
): ReviewRating {
  const rounded =
    Math.round(
      value
    );

  if (rounded <= 1) {
    return 1;
  }

  if (rounded >= 5) {
    return 5;
  }

  return rounded as ReviewRating;
}

function createExactRatingDistribution(
  reviews:
    Array<{
      rating: number;
    }>
): ReviewRatingDistribution {
  const distribution:
    ReviewRatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

  for (const review of reviews) {
    const rating =
      toReviewRating(
        review.rating
      );

    distribution[rating] += 1;
  }

  return distribution;
}

export const getProductPage =
  cache(
    async (
      slugInput: string
    ): Promise<
      ProductPageData |
      null
    > => {
      const slug =
        normalizeSlug(
          slugInput
        );

      if (!slug) {
        return null;
      }

      const workspace =
        await resolveCatalogWorkspace(
          null
        );

      if (!workspace) {
        return null;
      }

      /*
       * The public catalog service remains the visibility authority:
       * workspace, publication, activity and vendor eligibility are
       * resolved before the canonical page can expose a product.
       */
      const products =
        await getCatalog(
          workspace
        );

      const selectedProduct =
        products.find(
          product =>
            product.slug
              .trim()
              .toLowerCase() ===
            slug
        );

      if (!selectedProduct) {
        return null;
      }

      const categories =
        await getCatalogCategories();

      const categoryRecord =
        categories.find(
          category =>
            category.slug ===
            selectedProduct.category
        );

      const workspaceRecord =
        await prisma.workspace
          .findUnique({
            where: {
              id: workspace.id
            },
            select: {
              id: true,
              name: true,
              currency: true
            }
          });

      if (!workspaceRecord) {
        return null;
      }

      const productIdentity =
        await prisma.product
          .findUnique({
            where: {
              id: selectedProduct.id
            },
            select: {
              brand: {
                select: {
                  slug: true,
                  name: true,
                  description: true,
                  logo: true
                }
              }
            }
          });

      const reviewRecords =
        await prisma.review
          .findMany({
            where: {
              productId:
                selectedProduct.id,
              status:
                'APPROVED'
            },
            select: {
              id: true,
              rating: true,
              title: true,
              comment: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: {
              updatedAt:
                'desc'
            }
          });

      const reviewerIds = [
        ...new Set(
          reviewRecords.map(
            review =>
              review.user.id
          )
        )
      ];

      const completedPurchases =
        reviewerIds.length > 0
          ? await prisma.order.findMany({
              where: {
                userId: {
                  in: reviewerIds
                },
                status: 'DELIVERED',
                paymentStatus: 'PAID',
                items: {
                  some: {
                    productId:
                      selectedProduct.id
                  }
                }
              },
              select: {
                userId: true
              }
            })
          : [];

      const verifiedReviewerIds =
        new Set(
          completedPurchases.map(
            purchase =>
              purchase.userId
          )
        );

      const publicReviews:
        ExperienceReview[] =
          reviewRecords.map(
            review => ({
              id: review.id,
              targetType:
                'product',
              targetId:
                selectedProduct.id,
              author: {
                id:
                  review.user.id,
                name:
                  review.user.name,
                ...(review.user.image
                  ? {
                      avatar:
                        review.user.image
                    }
                  : {})
              },
              rating:
                toReviewRating(
                  review.rating
                ),
              ...(review.title
                ? {
                    title:
                      review.title
                  }
                : {}),
              comment:
                review.comment ?? '',
              verified:
                verifiedReviewerIds.has(
                  review.user.id
                ),
              helpfulCount: 0,
              createdAt:
                review.createdAt
                  .toISOString(),
              updatedAt:
                review.updatedAt
                  .toISOString()
            })
          );

      const reviewCount =
        publicReviews.length;

      const averageRating =
        reviewCount > 0
          ? publicReviews.reduce(
              (
                total,
                review
              ) =>
                total +
                review.rating,
              0
            ) /
            reviewCount
          : 0;

      const product = {
        ...selectedProduct,
        rating:
          averageRating,
        reviews:
          reviewCount
      };

      const relationships =
        resolveProductRelationships(
          product,
          products
        );

      const reviews:
        ReviewsModuleDefinition['data'] = {
          targetType:
            'product',
          targetId:
            product.id,
          targetName:
            product.name,
          title:
            'Customer Reviews',
          subtitle:
            `Verified and moderated customer experiences with ${product.name}.`,
          averageRating,
          reviewCount,
          ratingDistribution:
            createExactRatingDistribution(
              reviewRecords
            ),
          reviews:
            publicReviews,
          locale:
            'en-NG',
          /*
           * The route server component replaces this with the
           * authenticated session state before rendering.
           */
          canWriteReview:
            false
        };

      const categoryDescription =
        categoryRecord
          ?.description
          ?.trim() ||
        undefined;

      const categoryShortDescription =
        categoryRecord
          ?.shortDescription
          ?.trim() ||
        undefined;

      const categoryCoverImage =
        categoryRecord
          ?.coverImages?.[0] ??
        categoryRecord
          ?.image ??
        product.images?.[0] ??
        product.variants[0]?.image;

      return {
        workspace: {
          id:
            workspaceRecord.id,
          name:
            workspaceRecord.name
        },
        product,
        category: {
          slug:
            product.category,
          label:
            categoryRecord?.label ??
            product.category,
          ...(categoryDescription
            ? {
                description:
                  categoryDescription
              }
            : {}),
          ...(categoryShortDescription
            ? {
                shortDescription:
                  categoryShortDescription
              }
            : {}),
          ...(categoryCoverImage
            ? {
                coverImage:
                  categoryCoverImage
              }
            : {}),
          ...(categoryRecord?.accentColor
            ? {
                accentColor:
                  categoryRecord
                    .accentColor
              }
            : {})
        },
        ...(productIdentity?.brand
          ? {
              brand: {
                slug:
                  productIdentity
                    .brand.slug,
                name:
                  productIdentity
                    .brand.name,
                ...(productIdentity
                  .brand.description
                  ? {
                      description:
                        productIdentity
                          .brand
                          .description
                    }
                  : {}),
                ...(productIdentity
                  .brand.logo
                  ? {
                      logo:
                        productIdentity
                          .brand.logo
                    }
                  : {})
              }
            }
          : {}),
        reviews,
        relationships: {
          pairings:
            relationships
              .pairingProducts,
          similar:
            relationships
              .similarProducts,
          continueDiscovery:
            relationships
              .continueDiscoveryProducts
        },
        locale:
          'en-NG',
        currency:
          workspaceRecord.currency ??
          'NGN'
      };
    }
  );
