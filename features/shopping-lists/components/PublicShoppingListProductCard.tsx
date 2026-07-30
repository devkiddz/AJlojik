'use client';

import Image from 'next/image';

import {
  ArrowRight,
  PackageX
} from 'lucide-react';

import {
  openCustomerProductExperience
} from '@/features/customer-experience';

import {
  ProductActionTray
} from '@/features/products/cards/ProductActionTray';

import type {
  ShoppingListItem
} from '../shoppingListTypes';

type PublicShoppingListProductCardProps = {
  item:
    ShoppingListItem;

  listId: string;
  listName: string;
};

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0
    }
  ).format(
    value
  );
}

export function PublicShoppingListProductCard({
  item,
  listId,
  listName
}: PublicShoppingListProductCardProps) {
  const variant =
    item.variant ??
    item.product.variants.find(
      currentVariant =>
        currentVariant.stockLeft >
        0
    ) ??
    item.product.variants[0] ??
    null;

  const image =
    variant?.image ??
    '/placeholder.svg';

  const unitPrice =
    item.promotion
      ?.promotionalPrice ??
    variant?.price ??
    0;

  const unavailable =
    !variant ||
    variant.stockLeft <=
      0;

  const openProduct =
    () => {
      openCustomerProductExperience({
        id:
          item.product.id,

        name:
          item.product.name,

        shortDescription:
          item.product
            .shortDescription,

        contextLabel:
          `Public list: ${listName}`,

        route:
          `/lists/${listId}`,

        surface:
          'shopping-list-product'
      });
    };

  return (
    <article className="group overflow-hidden rounded-3xl border bg-card transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg">
      <button
        type="button"
        onClick={
          openProduct
        }
        aria-label={`Open ${item.product.name} in the Product Experience`}
        className="block w-full text-left">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={
              image
            }
            alt={
              item.product.name
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />

          {unavailable ? (
            <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-black/70 px-3 py-2 text-[10px] font-bold text-white backdrop-blur">
              <PackageX className="size-3.5" />

              Currently unavailable
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {
              item.product.category.replaceAll(
                '-',
                ' '
              )
            }
          </p>

          <h2 className="mt-1 line-clamp-2 min-h-12 font-semibold">
            {
              item.product.name
            }
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Planned quantity:{' '}
            {
              item.quantity
            }
          </p>

          <div className="mt-4 flex items-end justify-between gap-3 border-t pt-3">
            <span className="font-bold">
              {
                formatCurrency(
                  unitPrice
                )
              }
            </span>

            <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </button>

      {variant ? (
        <div className="border-t px-3 py-3">
          <ProductActionTray
            product={
              item.product
            }
            variant={
              variant
            }
            presentation="inline"
            compact
            className="w-fit max-w-full"
          />
        </div>
      ) : null}
    </article>
  );
}
