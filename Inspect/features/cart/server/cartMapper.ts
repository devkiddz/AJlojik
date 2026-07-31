import type {
  Prisma
} from '@/lib/generated/prisma/client';

import type {
  ProductVariantType
} from '@/types/types';

import {
  calculateAvailableStock,
  mapProductRecord,
  productMappingInclude
} from '@/features/products/server/productMapper';

import type {
  CartItem
} from '../cartTypes';

export const cartItemInclude = {
  product: {
    include:
      productMappingInclude
  },

  variant: {
    include: {
      inventory: true
    }
  }
} satisfies Prisma.CartItemInclude;

export type CartItemRecord =
  Prisma.CartItemGetPayload<{
    include:
      typeof cartItemInclude;
  }>;

export function mapCartItem(
  record: CartItemRecord
): CartItem {
  const product =
    mapProductRecord(
      record.product
    );

  const fallbackImage =
    product.variants[0]?.image ??
    '/placeholder.svg';

  const selectedVariant:
    ProductVariantType = {
      id: record.variant.id,
      label:
        record.variant.label,

      image:
        record.variant.image ??
        fallbackImage,

      price: Number(
        record.variant.price
      ),

      stockLeft:
        calculateAvailableStock(
          record.variant.inventory
        )
    };

  return {
    id: record.id,

    productId:
      record.productId,

    variantId:
      record.variantId,

    product,
    variant:
      selectedVariant,

    quantity:
      record.quantity,

    createdAt:
      record.createdAt.toISOString(),

    updatedAt:
      record.updatedAt.toISOString()
  };
}

export function mapCartItems(
  records: CartItemRecord[]
): CartItem[] {
  return records.map(
    mapCartItem
  );
}