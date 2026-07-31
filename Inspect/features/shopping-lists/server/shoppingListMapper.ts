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
  ShoppingList,
  ShoppingListItem,
  ShoppingListPromotion
} from '../shoppingListTypes';

export const shoppingListInclude = {
  items: {
    orderBy: [
      {
        position: 'asc'
      },
      {
        addedAt: 'asc'
      }
    ],

    include: {
      product: {
        include: {
          ...productMappingInclude,

          promotionProducts: {
            include: {
              promotion: true
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
    }
  }
} satisfies Prisma.ShoppingListInclude;

export type ShoppingListRecord =
  Prisma.ShoppingListGetPayload<{
    include:
      typeof shoppingListInclude;
  }>;

type ShoppingListItemRecord =
  ShoppingListRecord['items'][number];

function resolveActivePromotion(
  record: ShoppingListItemRecord
): ShoppingListPromotion | null {
  const now =
    Date.now();

  const promotionProduct =
    record.product.promotionProducts.find(
      entry => {
        if (
          !entry.promotion.active
        ) {
          return false;
        }

        const startsAt =
          entry.promotion.startsAt?.getTime() ??
          null;

        const endsAt =
          entry.promotion.endsAt?.getTime() ??
          null;

        if (
          startsAt !== null &&
          startsAt > now
        ) {
          return false;
        }

        if (
          endsAt !== null &&
          endsAt < now
        ) {
          return false;
        }

        return true;
      }
    );

  if (!promotionProduct) {
    return null;
  }

  return {
    id:
      promotionProduct.promotion.id,

    title:
      promotionProduct.promotion.title,

    discountPercentage:
      promotionProduct.discountPercentage,

    promotionalPrice:
      promotionProduct.promotionalPrice ===
      null
        ? null
        : Number(
            promotionProduct.promotionalPrice
          ),

    startsAt:
      promotionProduct.promotion.startsAt?.toISOString() ??
      null,

    endsAt:
      promotionProduct.promotion.endsAt?.toISOString() ??
      null
  };
}

export function mapShoppingListItem(
  record: ShoppingListItemRecord
): ShoppingListItem {
  const product =
    mapProductRecord(
      record.product
    );

  const fallbackImage =
    product.variants[0]?.image ??
    '/placeholder.svg';

  const variant:
    ProductVariantType | null =
    record.variant
      ? {
          id:
            record.variant.id,

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
        }
      : null;

  return {
    id: record.id,

    productId:
      record.productId,

    variantId:
      record.variantId,

    product,
    variant,

    quantity:
      record.quantity,

    position:
      record.position,

    note:
      record.note,

    promotion:
      resolveActivePromotion(
        record
      ),

    addedAt:
      record.addedAt.toISOString(),

    updatedAt:
      record.updatedAt.toISOString()
  };
}

function resolveItemPrice(
  item: ShoppingListItem
): number {
  if (
    item.promotion
      ?.promotionalPrice !==
    null &&
    item.promotion
      ?.promotionalPrice !==
    undefined
  ) {
    return item.promotion
      .promotionalPrice;
  }

  if (item.variant) {
    return item.variant.price;
  }

  return (
    item.product
      .variants[0]?.price ??
    0
  );
}

export function mapShoppingList(
  record: ShoppingListRecord
): ShoppingList {
  const items =
    record.items.map(
      mapShoppingListItem
    );

  const totalQuantity =
    items.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  const totalValue =
    items.reduce(
      (total, item) =>
        total +
        resolveItemPrice(item) *
          item.quantity,
      0
    );

  return {
    id: record.id,

    workspaceId:
      record.workspaceId,

    userId:
      record.userId,

    name: record.name,

    description:
      record.description,

    visibility:
      record.visibility,

    status:
      record.status,

    publicationStatus:
      record.publicationStatus,

    publicationSubmittedAt:
      record.publicationSubmittedAt?.toISOString() ?? null,

    publicationReviewedAt:
      record.publicationReviewedAt?.toISOString() ?? null,

    publicationPublishedAt:
      record.publicationPublishedAt?.toISOString() ?? null,

    publicationReviewNote:
      record.publicationReviewNote,

    position:
      record.position,

    items,

    itemCount:
      items.length,

    totalQuantity,
    totalValue,

    createdAt:
      record.createdAt.toISOString(),

    updatedAt:
      record.updatedAt.toISOString()
  };
}

export function mapShoppingLists(
  records:
    ShoppingListRecord[]
): ShoppingList[] {
  return records.map(
    mapShoppingList
  );
}