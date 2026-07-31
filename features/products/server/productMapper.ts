import type {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

export const productMappingInclude = {
  category: true,
  subcategory: true,
  vendorProfile: {
    include: {
      logoMediaAsset: true
    }
  },

  images: {
    orderBy: {
      position: 'asc'
    }
  },

  variants: {
    where: {
      active: true
    },

    include: {
      inventory: true
    },

    orderBy: {
      position: 'asc'
    }
  }
} satisfies Prisma.ProductInclude;

export type ProductMappingRecord =
  Prisma.ProductGetPayload<{
    include: typeof productMappingInclude;
  }>;

export function calculateAvailableStock(
  inventory:
    | {
        quantity: number;
        reserved: number;
      }
    | null
): number {
  if (!inventory) {
    return 0;
  }

  return Math.max(
    inventory.quantity -
      inventory.reserved,
    0
  );
}

export function getPrimaryProductImage(
  product: Pick<
    ProductMappingRecord,
    'images'
  >
): string {
  const primaryImage =
    product.images.find(
      image => image.primary
    ) ??
    product.images[0] ??
    null;

  return (
    primaryImage?.url ??
    '/placeholder.svg'
  );
}

export function mapProductVariantRecord(
  variant: ProductMappingRecord['variants'][number],
  fallbackImage: string
): ProductVariantType {
  return {
    id: variant.id,
    label: variant.label,

    image:
      variant.image ??
      fallbackImage,

    price: Number(
      variant.price
    ),

    stockLeft:
      calculateAvailableStock(
        variant.inventory
      )
  };
}

export function mapProductRecord(
  product: ProductMappingRecord
): ProductType {
  const fallbackImage =
    getPrimaryProductImage(
      product
    );

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
      product.shortDescription ??
      '',

    longDescription:
      product.longDescription ??
      '',

    category:
      product.category.slug,

    subcategory:
      product.subcategory?.slug,

    tags: product.tags,

    variants:
      product.variants.map(
        variant =>
          mapProductVariantRecord(
            variant,
            fallbackImage
          )
      ),

    rating: product.rating,

    reviews:
      product.reviewsCount,

    soldCount:
      product.soldCount,

    liked: false,

    featured:
      product.featured,

    isNew:
      product.isNew,

    estimatedDelivery:
      product.estimatedDelivery ??
      'Delivery details available at checkout',

    discountPercentage:
      product.discountPercentage
  };
}