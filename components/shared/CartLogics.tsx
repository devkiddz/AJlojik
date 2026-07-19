'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Heart,
  LoaderCircle,
  PackageOpen,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';

import { useMemo, useState, type ReactNode } from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { useWishlist } from '@/features/wishlist';
import { cn } from '@/lib/utils';

type ShoppingView = 'cart' | 'wishlist';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export function CartLogics() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<ShoppingView>('cart');

  const { items, totalQuantity, subtotal, loading: cartLoading, error: cartError } = useCart();
  const { products } = useCatalog();
  const {
    productIds: wishlistProductIds,
    count: wishlistCount,
    loading: wishlistLoading,
    error: wishlistError,
    canPersist
  } = useWishlist();

  const displayedQuantity = totalQuantity > 99 ? '99+' : totalQuantity;

  const wishlistProducts = useMemo(() => {
    const productById = new Map(products.map(product => [product.id, product]));

    return wishlistProductIds
      .map(productId => productById.get(productId))
      .filter(product => product !== undefined)
      .slice(0, 3);
  }, [products, wishlistProductIds]);

  const navigateTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const activeLoading = activeView === 'cart' ? cartLoading : wishlistLoading;
  const activeError = activeView === 'cart' ? cartError : wishlistError;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={`Open shopping activity. ${totalQuantity} cart items and ${wishlistCount} saved products.`}
        className="rounded-full outline-none">
        <div className="flex flex-col gap-1">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/50">
            <ShoppingBag className="size-4" />

            {!cartLoading && totalQuantity > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-4 text-accent-foreground shadow-sm">
                {displayedQuantity}
              </span>
            ) : null}

            {!wishlistLoading && wishlistCount > 0 ? (
              <span className="absolute -bottom-1 -left-1 grid size-4 place-items-center rounded-full border-2 border-card bg-rose-500 text-white">
                <Heart className="size-2.5 fill-current" />
              </span>
            ) : null}
          </div>

          <span className="hidden text-xs md:inline">Activity</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-0 shadow-2xl backdrop-blur-2xl">
        <div className="border-b border-border/60 bg-card/70 px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Your shopping
              </p>
              <h2 className="mt-1 text-base font-bold tracking-tight">Activity preview</h2>
            </div>

            <div className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              {totalQuantity + wishlistCount} items
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-xl bg-muted/70 p-1">
            <button
              type="button"
              onClick={() => setActiveView('cart')}
              aria-pressed={activeView === 'cart'}
              className={cn(
                'flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
                activeView === 'cart' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              )}>
              <ShoppingCart className="size-3.5" />
              Cart
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px]">{displayedQuantity}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('wishlist')}
              aria-pressed={activeView === 'wishlist'}
              className={cn(
                'flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
                activeView === 'wishlist' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              )}>
              <Heart className="size-3.5" />
              Wishlist
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px]">{wishlistCount}</span>
            </button>
          </div>
        </div>

        <div className="max-h-[min(25rem,60vh)] overflow-y-auto p-3">
          {activeLoading ? (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <LoaderCircle className="mx-auto size-5 animate-spin text-primary" />
                <p className="mt-3 text-xs text-muted-foreground">Loading your activity…</p>
              </div>
            </div>
          ) : activeError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs leading-5 text-destructive">
              {activeError}
            </div>
          ) : activeView === 'cart' ? (
            items.length ? (
              <div className="space-y-2">
                {items.slice(0, 3).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(`/products/${item.product.slug}`)}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2 text-left transition hover:border-border/60 hover:bg-card">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={item.variant.image} alt={item.product.name} fill sizes="56px" className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{item.product.name}</p>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground">{item.variant.label}</p>
                      <p className="mt-1 text-xs font-bold">{currencyFormatter.format(item.variant.price)}</p>
                    </div>

                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">×{item.quantity}</span>
                  </button>
                ))}

                {items.length > 3 ? (
                  <p className="px-2 py-1 text-center text-[10px] text-muted-foreground">
                    +{items.length - 3} more selections
                  </p>
                ) : null}
              </div>
            ) : (
              <EmptyActivity icon={<PackageOpen className="size-6" />} title="Your cart is empty" description="Products you add will appear here instantly." />
            )
          ) : wishlistProducts.length ? (
            <div className="space-y-2">
              {wishlistProducts.map(product => {
                const variant = product.variants.find(item => item.stockLeft > 0) ?? product.variants[0];

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => navigateTo(`/products/${product.slug}`)}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2 text-left transition hover:border-border/60 hover:bg-card">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {variant ? <Image src={variant.image} alt={product.name} fill sizes="56px" className="object-cover" /> : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{product.name}</p>
                      <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground">{product.shortDescription}</p>
                      <p className="mt-1 text-xs font-bold">
                        {variant ? currencyFormatter.format(variant.price) : 'Unavailable'}
                      </p>
                    </div>

                    <Heart className="size-4 shrink-0 fill-rose-500 text-rose-500" />
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyActivity
              icon={<Heart className="size-6" />}
              title="No saved products yet"
              description={canPersist ? 'Tap the heart on a product to build your wishlist.' : 'Sign in to save products across devices.'}
            />
          )}
        </div>

        <div className="border-t border-border/60 bg-card/50 p-3">
          {activeView === 'cart' && items.length ? (
            <div className="mb-3 flex items-center justify-between px-1 text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{currencyFormatter.format(subtotal)}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => navigateTo(activeView === 'cart' ? '/cart' : '/wishlist')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-semibold text-background transition hover:opacity-90">
            {activeView === 'cart' ? 'Open cart' : 'Open wishlist'}
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyActivity({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-5 text-center">
      <div>
        <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">{icon}</div>
        <p className="mt-3 text-sm font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-56 text-[11px] leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
