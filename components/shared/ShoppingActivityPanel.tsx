'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Heart,
  LoaderCircle,
  PackageOpen,
  ShoppingCart,
  Trash2
} from 'lucide-react';

import {
  useMemo,
  useState,
  type ReactNode
} from 'react';

import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { openCustomerProductExperience } from '@/features/customer-experience';
import { useWishlist } from '@/features/wishlist';
import { cn } from '@/lib/utils';

type ShoppingView = 'cart' | 'wishlist';

type ShoppingActivityPanelProps = {
  onNavigate?: () => void;
};

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export function ShoppingActivityPanel({
  onNavigate
}: ShoppingActivityPanelProps) {
  const router = useRouter();

  const [activeView, setActiveView] =
    useState<ShoppingView>('cart');

  const {
    items,
    totalQuantity,
    subtotal,
    loading: cartLoading,
    error: cartError,
    removeFromCart
  } = useCart();

  const { products } = useCatalog();

  const {
    productIds: wishlistProductIds,
    count: wishlistCount,
    loading: wishlistLoading,
    error: wishlistError,
    canPersist,
    removeProduct,
    isMutating: isWishlistMutating
  } = useWishlist();

  const [
    removingCartItemId,
    setRemovingCartItemId
  ] = useState<string | null>(null);

  const removeCartItem = async (
    itemId: string
  ) => {
    setRemovingCartItemId(itemId);

    try {
      await removeFromCart(itemId);
    } finally {
      setRemovingCartItemId(null);
    }
  };

  const displayedQuantity =
    totalQuantity > 99
      ? '99+'
      : totalQuantity;

  const wishlistProducts = useMemo(() => {
    const productById = new Map(
      products.map(product => [
        product.id,
        product
      ])
    );

    return wishlistProductIds
      .map(productId =>
        productById.get(productId)
      )
      .filter(
        product =>
          product !== undefined
      )
      .slice(0, 3);
  }, [
    products,
    wishlistProductIds
  ]);

  const navigateTo = (
    href: string
  ) => {
    onNavigate?.();
    router.push(href);
  };

  const openProduct = (
    product: {
      id: string;
      name: string;
      shortDescription?: string | null;
    }
  ) => {
    onNavigate?.();
    openCustomerProductExperience(product);
  };

  const activeLoading =
    activeView === 'cart'
      ? cartLoading
      : wishlistLoading;

  const activeError =
    activeView === 'cart'
      ? cartError
      : wishlistError;

  return (
    <div className="overflow-hidden">
      <div className="border-b border-border/60 bg-card/70 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Your shopping
            </p>

            <h2 className="mt-1 text-base font-bold tracking-tight">
              Activity preview
            </h2>
          </div>

          <div className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {totalQuantity + wishlistCount} items
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 rounded-xl bg-muted/70 p-1">
          <button
            type="button"
            onClick={() =>
              setActiveView('cart')
            }
            aria-pressed={
              activeView === 'cart'
            }
            className={cn(
              'flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
              activeView === 'cart'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}>
            <ShoppingCart className="size-3.5" />

            Cart

            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px]">
              {displayedQuantity}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveView('wishlist')
            }
            aria-pressed={
              activeView === 'wishlist'
            }
            className={cn(
              'flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
              activeView === 'wishlist'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}>
            <Heart className="size-3.5" />

            Wishlist

            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px]">
              {wishlistCount}
            </span>
          </button>
        </div>
      </div>

      <div className="max-h-[min(25rem,55vh)] overflow-y-auto p-3">
        {activeLoading ? (
          <div className="grid min-h-52 place-items-center text-center">
            <div>
              <LoaderCircle className="mx-auto size-5 animate-spin text-primary" />

              <p className="mt-3 text-xs text-muted-foreground">
                Loading your activity…
              </p>
            </div>
          </div>
        ) : activeError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs leading-5 text-destructive">
            {activeError}
          </div>
        ) : activeView === 'cart' ? (
          items.length ? (
            <div className="space-y-2">
              {items
                .slice(0, 3)
                .map(item => (
                  <div
                    key={item.id}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2 text-left transition hover:border-border/60 hover:bg-card">
                    <button
                      type="button"
                      onClick={() =>
                        openProduct({
                          id: item.product.id,
                          name: item.product.name
                        })
                      }
                      className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={item.variant.image}
                        alt={item.product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openProduct({
                          id: item.product.id,
                          name: item.product.name
                        })
                      }
                      className="min-w-0 flex-1 text-left">
                      <p className="truncate text-xs font-semibold">
                        {item.product.name}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-muted-foreground">
                        {item.variant.label}
                      </p>

                      <p className="mt-1 text-xs font-bold">
                        {currencyFormatter.format(
                          item.variant.price
                        )}
                      </p>
                    </button>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">
                        ×{item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          removingCartItemId ===
                          item.id
                        }
                        onClick={() =>
                          void removeCartItem(
                            item.id
                          )
                        }
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-50">
                        {removingCartItemId ===
                        item.id ? (
                          <LoaderCircle className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}

                        Remove
                      </button>
                    </div>
                  </div>
                ))}

              {items.length > 3 ? (
                <p className="px-2 py-1 text-center text-[10px] text-muted-foreground">
                  +{items.length - 3} more
                  selections
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyActivity
              icon={
                <PackageOpen className="size-6" />
              }
              title="Your cart is empty"
              description="Products you add will appear here instantly."
            />
          )
        ) : wishlistProducts.length ? (
          <div className="space-y-2">
            {wishlistProducts.map(
              product => {
                const variant =
                  product.variants.find(
                    item =>
                      item.stockLeft > 0
                  ) ??
                  product.variants[0];

                return (
                  <div
                    key={product.id}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2 text-left transition hover:border-border/60 hover:bg-card">
                    <button
                      type="button"
                      onClick={() =>
                        openProduct({
                          id: product.id,
                          name: product.name,
                          shortDescription:
                            product.shortDescription
                        })
                      }
                      className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {variant ? (
                        <Image
                          src={variant.image}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openProduct({
                          id: product.id,
                          name: product.name,
                          shortDescription:
                            product.shortDescription
                        })
                      }
                      className="min-w-0 flex-1 text-left">
                      <p className="truncate text-xs font-semibold">
                        {product.name}
                      </p>

                      <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">
                        {
                          product.shortDescription
                        }
                      </p>

                      <p className="mt-1 text-xs font-bold">
                        {variant
                          ? currencyFormatter.format(
                              variant.price
                            )
                          : 'Unavailable'}
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={isWishlistMutating(
                        product.id
                      )}
                      onClick={() =>
                        void removeProduct(
                          product.id
                        )
                      }
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-50">
                      {isWishlistMutating(
                        product.id
                      ) ? (
                        <LoaderCircle className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}

                      Remove
                    </button>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <EmptyActivity
            icon={
              <Heart className="size-6" />
            }
            title="No saved products yet"
            description={
              canPersist
                ? 'Tap the heart on a product to build your wishlist.'
                : 'Sign in to save products across devices.'
            }
          />
        )}
      </div>

      <div className="border-t border-border/60 bg-card/50 p-3">
        {activeView === 'cart' &&
        items.length ? (
          <div className="mb-3 flex items-center justify-between px-1 text-xs">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span className="font-bold">
              {currencyFormatter.format(
                subtotal
              )}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() =>
            navigateTo(
              activeView === 'cart'
                ? '/cart'
                : '/wishlist'
            )
          }
          className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-semibold text-background transition hover:opacity-90">
          {activeView === 'cart'
            ? 'Open cart'
            : 'Open wishlist'}

          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyActivity({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-5 text-center">
      <div>
        <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </div>

        <p className="mt-3 text-sm font-semibold">
          {title}
        </p>

        <p className="mx-auto mt-1 max-w-56 text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
