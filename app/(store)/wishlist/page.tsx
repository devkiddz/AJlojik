'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowLeft, ArrowRight, Heart, LoaderCircle, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';

import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { useWishlist } from '@/features/wishlist';

import type { ProductType } from '@/types/types';

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export default function WishlistPage() {
  const { products, loading: catalogLoading } = useCatalog();
  const { addToCart } = useCart();
  const {
    productIds,
    count,
    loading,
    error,
    canPersist,
    removeProduct,
    refreshWishlist,
    isMutating
  } = useWishlist();

  const productById = new Map(products.map(product => [String(product.id), product]));
  const savedProducts = productIds
    .map(productId => productById.get(productId))
    .filter((product): product is ProductType => Boolean(product));
  const isLoading = loading || catalogLoading;

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to store
      </Link>

      <header className="relative mt-5 overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-rose-500/15 via-card to-card p-6 shadow-xl sm:p-9">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-rose-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
              <Heart className="size-7 fill-current" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">Your library</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Saved products</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Keep the products you love together, then move them into your cart whenever the moment is right.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/60 px-5 py-3 backdrop-blur">
            <p className="text-2xl font-black">{isLoading ? '…' : count}</p>
            <p className="text-xs text-muted-foreground">saved {count === 1 ? 'product' : 'products'}</p>
          </div>
        </div>
      </header>

      {error ? (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm">
          <span>{error}</span>
          <button type="button" onClick={() => void refreshWishlist()} className="inline-flex items-center gap-2 font-bold text-destructive">
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      ) : null}

      {!canPersist && !isLoading ? (
        <EmptyState
          title="Sign in to start your wishlist"
          description="Saved products sync securely with your account and remain available across devices."
          href="/sign-in?returnTo=/wishlist"
          action="Sign in"
        />
      ) : isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : savedProducts.length === 0 ? (
        <EmptyState
          title="Your wishlist is ready"
          description="Explore the discovery hub and tap the heart on anything worth returning to."
          href="/store"
          action="Discover products"
        />
      ) : (
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Saved collection</p>
              <h2 className="mt-1 text-xl font-black">Pick up where you left off</h2>
            </div>
            <Link href="/store" className="hidden items-center gap-1 text-xs font-bold text-primary sm:inline-flex">
              Keep exploring <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
            {savedProducts.map(product => (
              <WishlistCard
                key={product.id}
                product={product}
                busy={isMutating(String(product.id))}
                onRemove={() => removeProduct(String(product.id))}
                onAddToCart={async () => {
                  const variant = product.variants.find(item => item.stockLeft > 0);
                  if (!variant) return;
                  await addToCart({ product, variant, quantity: 1 });
                }}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function WishlistCard({ product, busy, onRemove, onAddToCart }: {
  product: ProductType;
  busy: boolean;
  onRemove: () => Promise<void>;
  onAddToCart: () => Promise<void>;
}) {
  const variant = product.variants.find(item => item.stockLeft > 0) ?? product.variants[0];
  const inStock = Boolean(variant && variant.stockLeft > 0);

  return (
    <article className="group w-[72vw] max-w-[250px] shrink-0 snap-start rounded-3xl border border-border/55 bg-card p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-auto sm:max-w-none">
      <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-muted">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <Image src={variant?.image ?? '/products/placeholder.webp'} alt={product.name} fill sizes="(max-width: 640px) 72vw, 240px" className="object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onRemove()}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute right-2 top-2 inline-flex h-9 items-center gap-1.5 rounded-full bg-background/90 px-3 text-[10px] font-bold text-rose-500 shadow-md backdrop-blur transition hover:scale-[1.02] disabled:opacity-50">
          {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          <span>{busy ? 'Removing' : 'Remove from list'}</span>
        </button>
      </div>

      <div className="px-1 pb-1 pt-3">
        <Link href={`/products/${product.slug}`} className="line-clamp-1 text-sm font-black hover:underline">{product.name}</Link>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-black">{variant ? currency.format(variant.price) : 'Unavailable'}</p>
            <p className={`text-[10px] font-semibold ${inStock ? 'text-emerald-500' : 'text-destructive'}`}>{inStock ? 'In stock' : 'Out of stock'}</p>
          </div>
          <button
            type="button"
            disabled={!inStock}
            onClick={() => void onAddToCart()}
            aria-label={`Add ${product.name} to cart`}
            className="grid size-10 place-items-center rounded-full bg-foreground text-background shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40">
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <section className="mt-8 grid min-h-72 place-items-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-500/10 text-rose-500"><Heart className="size-6" /></div>
        <h2 className="mt-5 text-xl font-black">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <Link href={href} className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background">
          {action} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
