import type {
  Product as DatabaseProduct,
  ProductImage,
  ProductVariant,
  Inventory
} from '@/lib/generated/prisma/client';

import type { ProductType } from '@/types/types';

type DatabaseVariant = ProductVariant & {
  inventory: Inventory | null;
};

type DatabaseProductWithRelations = DatabaseProduct & {
  category: { slug: string };
  subcategory: { slug: string } | null;
  images: ProductImage[];
  variants: DatabaseVariant[];
  vendorProfile: {
    id: string;
    slug: string;
    name: string;
    logoMediaAsset: {
      secureUrl: string;
    } | null;
  } | null;
};

export function mapDatabaseProduct(
  product: DatabaseProductWithRelations
): ProductType {
  const orderedImages = [...product.images].sort(
    (firstImage, secondImage) =>
      firstImage.position - secondImage.position
  );

  const primaryImage =
    orderedImages.find(image => image.primary) ??
    orderedImages[0] ??
    null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    ownership: product.vendorProfile ? 'vendor' : 'platform',

    ...(product.vendorProfile
      ? {
          merchant: {
            id: product.vendorProfile.id,
            slug: product.vendorProfile.slug,
            name: product.vendorProfile.name,
            ...(product.vendorProfile.logoMediaAsset?.secureUrl
              ? {
                  logoUrl: product.vendorProfile.logoMediaAsset.secureUrl
                }
              : {})
          }
        }
      : {}),

    shortDescription:
      product.shortDescription ?? '',

    longDescription:
      product.longDescription ?? '',

    category: product.category.slug,

    ...(product.subcategory?.slug
      ? { subcategory: product.subcategory.slug }
      : {}),

    tags: product.tags,

    variants: [...product.variants]
      .sort(
        (firstVariant, secondVariant) =>
          firstVariant.position -
          secondVariant.position
      )
      .map(variant => ({
        id: variant.id,
        label: variant.label,

        image:
          variant.image ??
          primaryImage?.url ??
          '',

        price: Number(variant.price),

        stockLeft:
          variant.inventory?.quantity ?? 0
      })),

    rating: product.rating,
    reviews: product.reviewsCount,
    soldCount: product.soldCount,

    liked: false,

    featured: product.featured,
    isNew: product.isNew,

    estimatedDelivery:
      product.estimatedDelivery ??
      'Delivery details unavailable',

    discountPercentage:
      product.discountPercentage
  };
}