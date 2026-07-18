import type {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

import type {
  CartItem
} from '../cartTypes';

export const cartItemInclude = {
  product: {
    include: {
      category: true,
      subcategory: true,

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
    }
  },

  variant: {
    include: {
      inventory: true
    }
  }
} satisfies Prisma.CartItemInclude;

export type CartItemRecord =
  Prisma.CartItemGetPayload<{
    include: typeof cartItemInclude;
  }>;

function calculateStockLeft(
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
    inventory.quantity - inventory.reserved,
    0
  );
}

function getPrimaryProductImage(
  record: CartItemRecord['product']
): string {
  const primaryImage =
    record.images.find(image => image.primary) ??
    record.images[0];

  return primaryImage?.url ?? '/placeholder.svg';
}

function mapVariant(
  variant: CartItemRecord['product']['variants'][number],
  fallbackImage: string
): ProductVariantType {
  return {
    id: variant.id,
    label: variant.label,

    image:
      variant.image ??
      fallbackImage,

    price: Number(variant.price),

    stockLeft: calculateStockLeft(
      variant.inventory
    )
  };
}

function mapProduct(
  record: CartItemRecord['product']
): ProductType {
  const fallbackImage =
    getPrimaryProductImage(record);

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,

    shortDescription:
      record.shortDescription ?? '',

    longDescription:
      record.longDescription ?? '',

    category: record.category.slug,

    subcategory:
      record.subcategory?.slug,

    tags: record.tags,

    variants: record.variants.map(variant =>
      mapVariant(variant, fallbackImage)
    ),

    rating: record.rating,
    reviews: record.reviewsCount,
    soldCount: record.soldCount,

    liked: false,

    featured: record.featured,
    isNew: record.isNew,

    estimatedDelivery:
      record.estimatedDelivery ??
      'Delivery details available at checkout',

    discountPercentage:
      record.discountPercentage
  };
}

export function mapCartItem(
  record: CartItemRecord
): CartItem {
  const product = mapProduct(record.product);

  const fallbackImage =
    product.variants[0]?.image ??
    '/placeholder.svg';

  const selectedVariant: ProductVariantType = {
    id: record.variant.id,
    label: record.variant.label,

    image:
      record.variant.image ??
      fallbackImage,

    price: Number(record.variant.price),

    stockLeft: calculateStockLeft(
      record.variant.inventory
    )
  };

  return {
    id: record.id,

    productId: record.productId,
    variantId: record.variantId,

    product,
    variant: selectedVariant,

    quantity: record.quantity,

    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function mapCartItems(
  records: CartItemRecord[]
): CartItem[] {
  return records.map(mapCartItem);
}