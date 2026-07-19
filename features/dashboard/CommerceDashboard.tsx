'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Heart,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  WalletCards
} from 'lucide-react';

import { useMemo, type ReactNode } from 'react';

import SignOutButton from '@/components/auth/SignOutButton';
import { useCart } from '@/features/cart';
import { useCatalog } from '@/features/catalog';
import { useWishlist } from '@/features/wishlist';
import { useWorkspace } from '@/features/workspace';
import { cn } from '@/lib/utils';

import type { ProductType } from '@/types/types';

export type ExpensePoint = {
  month: string;
  value: number;
};

type CommerceDashboardProps = {
  user: {
    name: string;
    email: string;
    image: string | null;
    tier: string;
    emailVerified: boolean;
  };
  persona: string;
  personalizationEnabled: boolean;
  recentProductIds: string[];
  expenseSeries: ExpensePoint[];
  totalSpent: number;
  orderCount: number;
};

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-NG', {
  notation: 'compact',
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 1
});

export default function CommerceDashboard({
  user,
  persona,
  personalizationEnabled,
  recentProductIds,
  expenseSeries,
  totalSpent,
  orderCount
}: CommerceDashboardProps) {
  const { products, loading: catalogLoading } = useCatalog();
  const { items: cartItems, totalQuantity, subtotal, loading: cartLoading } = useCart();
  const { productIds: wishlistProductIds, count: wishlistCount, loading: wishlistLoading } = useWishlist();
  const { activeWorkspace } = useWorkspace();

  const productById = useMemo(() => new Map(products.map(product => [product.id, product])), [products]);

  const recentProducts = useMemo(
    () => recentProductIds.map(id => productById.get(id)).filter((product): product is ProductType => Boolean(product)),
    [productById, recentProductIds]
  );

  const wishlistProducts = useMemo(
    () => wishlistProductIds.map(id => productById.get(id)).filter((product): product is ProductType => Boolean(product)),
    [productById, wishlistProductIds]
  );

  const inventory = useMemo(() => {
    const variants = products.flatMap(product => product.variants);
    const totalUnits = variants.reduce((sum, variant) => sum + Math.max(variant.stockLeft, 0), 0);
    const lowStockVariants = variants.filter(variant => variant.stockLeft > 0 && variant.stockLeft <= 5).length;
    const outOfStockVariants = variants.filter(variant => variant.stockLeft <= 0).length;
    const inventoryValue = variants.reduce(
      (sum, variant) => sum + Math.max(variant.stockLeft, 0) * Number(variant.price),
      0
    );

    return { totalUnits, lowStockVariants, outOfStockVariants, inventoryValue, variantCount: variants.length };
  }, [products]);

  const recommendations = useMemo(() => {
    const excludedIds = new Set([
      ...recentProductIds,
      ...wishlistProductIds,
      ...cartItems.map(item => item.productId)
    ]);
    const preferredCategories = new Set([
      ...recentProducts.map(product => product.category),
      ...wishlistProducts.map(product => product.category),
      ...cartItems.map(item => item.product.category)
    ]);

    return [...products]
      .filter(product => !excludedIds.has(product.id) && product.variants.some(variant => variant.stockLeft > 0))
      .sort((first, second) => {
        const score = (product: ProductType) =>
          (preferredCategories.has(product.category) ? 6 : 0) +
          (product.featured ? 3 : 0) +
          (product.isNew ? 2 : 0) +
          product.rating;

        return score(second) - score(first);
      })
      .slice(0, 6);
  }, [cartItems, products, recentProductIds, recentProducts, wishlistProductIds, wishlistProducts]);

  const maxExpense = Math.max(...expenseSeries.map(point => point.value), subtotal, 1);
  const firstName = user.name.split(' ')[0] || user.name;
  const dashboardLoading = catalogLoading || cartLoading || wishlistLoading;

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.08),transparent_34%)] px-3 py-5 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-[94rem] space-y-5">
        <header className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-xl backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-foreground text-lg font-bold text-background shadow-lg sm:size-16">
                {user.image ? <Image src={user.image} alt={user.name} fill sizes="64px" className="object-cover" /> : user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">Personal commerce</p>
                  {user.emailVerified ? <BadgeCheck className="size-4 text-emerald-500" /> : null}
                </div>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}</h1>
                <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label={activeWorkspace?.name ?? 'Workspace'} value={activeWorkspace?.mode ?? 'LIVE'} />
              <StatusPill label="Experience" value={persona.replaceAll('-', ' ')} />
              <SignOutButton />
            </div>
          </div>
        </header>

        <section aria-label="Commerce overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<WalletCards />} label="Lifetime spend" value={currencyFormatter.format(totalSpent)} helper={`${orderCount} orders recorded`} tone="violet" />
          <MetricCard icon={<ShoppingBag />} label="Active cart" value={String(totalQuantity)} helper={currencyFormatter.format(subtotal)} tone="emerald" />
          <MetricCard icon={<Heart />} label="Saved products" value={String(wishlistCount)} helper="Synced wishlist" tone="rose" />
          <MetricCard icon={<Boxes />} label="Inventory units" value={inventory.totalUnits.toLocaleString()} helper={`${inventory.variantCount} product options`} tone="amber" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
          <article className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
            <SectionHeading eyebrow="Expense intelligence" title="Shopping activity" description="Completed order spend with your current cart shown as planned spend." actionHref="/orders" actionLabel="View orders" />

            <div className="mt-6 grid min-h-64 grid-cols-7 items-end gap-2 sm:gap-4">
              {expenseSeries.map(point => (
                <ExpenseBar key={point.month} label={point.month} value={point.value} maxValue={maxExpense} />
              ))}
              <ExpenseBar label="Cart" value={subtotal} maxValue={maxExpense} planned />
            </div>
          </article>

          <article className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
            <SectionHeading eyebrow="Store health" title="Inventory tracker" description="Live availability across catalog options." />

            <div className="mt-6 space-y-3">
              <InventoryRow icon={<PackageCheck />} label="Available units" value={inventory.totalUnits.toLocaleString()} tone="emerald" />
              <InventoryRow icon={<TriangleAlert />} label="Low-stock options" value={String(inventory.lowStockVariants)} tone="amber" />
              <InventoryRow icon={<Boxes />} label="Out-of-stock options" value={String(inventory.outOfStockVariants)} tone="rose" />
              <InventoryRow icon={<CircleDollarSign />} label="Catalog stock value" value={compactCurrencyFormatter.format(inventory.inventoryValue)} tone="violet" />
            </div>

            <div className="mt-5 rounded-2xl bg-muted/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Availability health</span>
                <span className="font-bold">{inventory.variantCount ? Math.round(((inventory.variantCount - inventory.outOfStockVariants) / inventory.variantCount) * 100) : 0}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${inventory.variantCount ? ((inventory.variantCount - inventory.outOfStockVariants) / inventory.variantCount) * 100 : 0}%` }} />
              </div>
            </div>
          </article>
        </section>

        <ProductSection
          eyebrow="Continue exploring"
          title="Recently viewed"
          description="Pick up where your latest shopping sessions stopped."
          products={recentProducts}
          emptyMessage="Your recently viewed products will appear as you explore the store."
        />

        <section className="grid gap-5 lg:grid-cols-2">
          <ShoppingListCard
            icon={<ShoppingBag className="size-5" />}
            eyebrow="Ready when you are"
            title="Cart products"
            count={totalQuantity}
            products={cartItems.map(item => item.product)}
            href="/cart"
            emptyMessage="Your cart is ready for something exceptional."
          />
          <ShoppingListCard
            icon={<Heart className="size-5" />}
            eyebrow="Your collection"
            title="Wishlist products"
            count={wishlistCount}
            products={wishlistProducts}
            href="/wishlist"
            emptyMessage="Save products to build your personal collection."
          />
        </section>

        <ProductSection
          eyebrow="Curated for you"
          title="Recommended next"
          description={personalizationEnabled ? 'Ranked from your recent categories, saved products, and cart activity.' : 'Popular premium products from across AJ Logik.'}
          products={recommendations}
          emptyMessage="Recommendations will appear when more catalog products are available."
          featured
        />

        {dashboardLoading ? <p className="text-center text-xs text-muted-foreground">Refreshing your commerce workspace…</p> : null}
      </div>
    </main>
  );
}

function MetricCard({ icon, label, value, helper, tone }: { icon: ReactNode; label: string; value: string; helper: string; tone: Tone }) {
  return (
    <article className="group rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('grid size-10 place-items-center rounded-2xl [&_svg]:size-4', toneStyles[tone])}>{icon}</div>
        <TrendingUp className="size-4 text-emerald-500" />
      </div>
      <p className="mt-5 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 truncate text-[10px] text-muted-foreground">{helper}</p>
    </article>
  );
}

function ExpenseBar({ label, value, maxValue, planned = false }: { label: string; value: number; maxValue: number; planned?: boolean }) {
  const height = value > 0 ? Math.max((value / maxValue) * 100, 8) : 3;

  return (
    <div className="group flex h-full min-w-0 flex-col justify-end text-center">
      <span className="mb-2 truncate text-[9px] font-semibold opacity-0 transition group-hover:opacity-100 sm:text-[10px]">{compactCurrencyFormatter.format(value)}</span>
      <div className="relative mx-auto flex h-48 w-full max-w-10 items-end overflow-hidden rounded-xl bg-muted/60 p-1 sm:h-52">
        <div className={cn('w-full rounded-lg transition-all duration-500 group-hover:brightness-110', planned ? 'bg-primary' : 'bg-foreground/80')} style={{ height: `${height}%` }} />
      </div>
      <span className={cn('mt-2 truncate text-[9px] sm:text-[10px]', planned ? 'font-bold text-primary' : 'text-muted-foreground')}>{label}</span>
    </div>
  );
}

function ProductSection({ eyebrow, title, description, products, emptyMessage, featured = false }: { eyebrow: string; title: string; description: string; products: ProductType[]; emptyMessage: string; featured?: boolean }) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/60 p-5 shadow-lg sm:p-6">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} actionHref="/store" actionLabel="Explore store" />
      {products.length ? (
        <div className={cn('mt-5 grid gap-3', featured ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6')}>
          {products.slice(0, 6).map(product => <DashboardProductCard key={product.id} product={product} />)}
        </div>
      ) : <EmptyPanel message={emptyMessage} />}
    </section>
  );
}

function DashboardProductCard({ product }: { product: ProductType }) {
  const variant = product.variants.find(item => item.stockLeft > 0) ?? product.variants[0];

  return (
    <Link href={`/products/${product.slug}`} className="group min-w-0 rounded-2xl p-2 transition hover:bg-muted/70">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm">
        {variant ? <Image src={variant.image} alt={product.name} fill sizes="180px" className="object-cover transition duration-500 group-hover:scale-105" /> : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-black shadow-sm">{variant ? compactCurrencyFormatter.format(variant.price) : 'N/A'}</span>
      </div>
      <p className="mt-2 truncate text-xs font-semibold">{product.name}</p>
      <p className="mt-1 truncate text-[10px] capitalize text-muted-foreground">{product.category.replaceAll('-', ' ')}</p>
    </Link>
  );
}

function ShoppingListCard({ icon, eyebrow, title, count, products, href, emptyMessage }: { icon: ReactNode; eyebrow: string; title: string; count: number; products: ProductType[]; href: string; emptyMessage: string }) {
  const uniqueProducts = Array.from(new Map(products.map(product => [product.id, product])).values()).slice(0, 4);

  return (
    <article className="rounded-[2rem] border border-border/60 bg-card/70 p-5 shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
          <div><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p><h2 className="mt-1 text-lg font-bold">{title}</h2></div>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{count}</span>
      </div>

      {uniqueProducts.length ? (
        <div className="mt-5 space-y-2">
          {uniqueProducts.map(product => {
            const variant = product.variants.find(item => item.stockLeft > 0) ?? product.variants[0];
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-muted/60">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">{variant ? <Image src={variant.image} alt={product.name} fill sizes="48px" className="object-cover" /> : null}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{variant ? currencyFormatter.format(variant.price) : 'Unavailable'}</p></div>
                <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      ) : <EmptyPanel message={emptyMessage} compact />}

      <Link href={href} className="mt-4 flex items-center justify-center gap-2 rounded-full border border-border/70 px-4 py-2.5 text-xs font-semibold transition hover:bg-foreground hover:text-background">Open {title.toLowerCase()} <ArrowRight className="size-3.5" /></Link>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description, actionHref, actionLabel }: { eyebrow: string; title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/70">{eyebrow}</p><h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{description}</p></div>
      {actionHref && actionLabel ? <Link href={actionHref} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">{actionLabel}<ArrowRight className="size-3.5" /></Link> : null}
    </div>
  );
}

function InventoryRow({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: Tone }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/45 p-3"><div className={cn('grid size-9 place-items-center rounded-xl [&_svg]:size-4', toneStyles[tone])}>{icon}</div><span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{label}</span><span className="text-sm font-bold">{value}</span></div>;
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-full border border-border/60 bg-background/65 px-3 py-2"><span className="text-[9px] text-muted-foreground">{label}</span><span className="ml-2 text-[10px] font-bold uppercase">{value}</span></div>;
}

function EmptyPanel({ message, compact = false }: { message: string; compact?: boolean }) {
  return <div className={cn('mt-5 grid place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 text-center', compact ? 'min-h-28' : 'min-h-40')}><div><Sparkles className="mx-auto size-5 text-muted-foreground" /><p className="mt-2 text-xs leading-5 text-muted-foreground">{message}</p></div></div>;
}

type Tone = 'violet' | 'emerald' | 'rose' | 'amber';
const toneStyles: Record<Tone, string> = {
  violet: 'bg-violet-500/10 text-violet-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  rose: 'bg-rose-500/10 text-rose-500',
  amber: 'bg-amber-500/10 text-amber-500'
};
