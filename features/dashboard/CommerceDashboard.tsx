'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ChevronRight,
  ClipboardCheck,
  CircleDollarSign,
  Eye,
  Heart,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Truck,
  WandSparkles,
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
  checkedOutCount: number;
  onDeliveryCount: number;
  shoppingListProductIds: string[];
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

function CommerceDashboardContent({
  user,
  persona,
  personalizationEnabled,
  recentProductIds,
  expenseSeries,
  totalSpent,
  orderCount,
  checkedOutCount,
  onDeliveryCount,
  shoppingListProductIds
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
  const shoppingListProducts = useMemo(() => shoppingListProductIds.map(id => productById.get(id)).filter((product): product is ProductType => Boolean(product)), [productById, shoppingListProductIds]);

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
      ...cartItems.map(item => item.product.category),
      ...shoppingListProducts.map(product => product.category)
    ]);
    const shoppingListIds = new Set(shoppingListProductIds);

    return [...products]
      .filter(product => !excludedIds.has(product.id) && product.variants.some(variant => variant.stockLeft > 0))
      .sort((first, second) => {
        const score = (product: ProductType) =>
          (preferredCategories.has(product.category) ? 6 : 0) +
          (shoppingListIds.has(product.id) ? 8 : 0) +
          (product.featured ? 3 : 0) +
          (product.isNew ? 2 : 0) +
          product.rating;

        return score(second) - score(first);
      })
      .slice(0, 6);
  }, [cartItems, products, recentProductIds, recentProducts, shoppingListProductIds, shoppingListProducts, wishlistProductIds, wishlistProducts]);

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

        <MobileCommerceDashboard
          inventory={inventory}
          recentProducts={recentProducts}
          wishlistProducts={wishlistProducts}
          cartProducts={cartItems.map(item => item.product)}
          recommendations={recommendations}
          shoppingListProducts={shoppingListProducts}
          wishlistCount={wishlistCount}
          cartCount={totalQuantity}
          checkedOutCount={checkedOutCount}
          onDeliveryCount={onDeliveryCount}
          totalSpent={totalSpent}
          orderCount={orderCount}
        />

        <div className="hidden space-y-5 sm:block">
        <section aria-label="Recent account activity" className="overflow-hidden rounded-[2.25rem] border border-border/60 bg-[linear-gradient(145deg,hsl(var(--card)/0.92),hsl(var(--muted)/0.42))] p-3 shadow-xl sm:p-5">
          <div className="mb-4 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">Customer journey</p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">Your latest commerce signals</h2>
            </div>
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
              <RelationshipPill label="Viewed" value={recentProducts.length} />
              <RelationshipPill label="In cart" value={totalQuantity} />
              <RelationshipPill label="Saved" value={wishlistCount} />
            </div>
          </div>

          <div className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-8 scrollbar-hide xl:grid xl:grid-cols-2 xl:overflow-visible xl:pb-0 xl:pr-0">
          <article className="w-[88vw] max-w-2xl shrink-0 snap-start rounded-[1.65rem] border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur sm:w-[78vw] sm:p-6 xl:w-auto xl:max-w-none">
            <SectionHeading eyebrow="Recent activity" title="Shopping activity" description="Completed order spend with your current cart shown as planned spend." actionHref="/orders" actionLabel="View orders" />

            <div className="mt-6 flex min-h-56 snap-x snap-mandatory items-end gap-3 overflow-x-auto overscroll-x-contain pb-2 pr-8 scrollbar-hide sm:grid sm:min-h-64 sm:grid-cols-7 sm:gap-4 sm:overflow-visible sm:pb-0 sm:pr-0">
              {expenseSeries.map(point => (
                <ExpenseBar key={point.month} label={point.month} value={point.value} maxValue={maxExpense} />
              ))}
              <ExpenseBar label="Cart" value={subtotal} maxValue={maxExpense} planned />
            </div>
          </article>

          <ProductSection
            eyebrow="Recent activity"
            title="Recently viewed"
            description="Pick up where your latest shopping sessions stopped."
            products={recentProducts}
            emptyMessage="Your recently viewed products will appear as you explore the store."
            compact
            journeyPeer
          />
          </div>
        </section>

        <section aria-label="Commerce overview" className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 pr-8 scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 sm:pr-0 xl:grid-cols-4">
          <MetricCard icon={<WalletCards />} label="Lifetime spend" value={currencyFormatter.format(totalSpent)} helper={`${orderCount} orders recorded`} tone="violet" />
          <MetricCard icon={<ShoppingBag />} label="Active cart" value={String(totalQuantity)} helper={currencyFormatter.format(subtotal)} tone="emerald" />
          <MetricCard icon={<Heart />} label="Saved products" value={String(wishlistCount)} helper="Synced wishlist" tone="rose" />
          <MetricCard icon={<Boxes />} label="Inventory units" value={inventory.totalUnits.toLocaleString()} helper={`${inventory.variantCount} product options`} tone="amber" />
        </section>

        <section>
          <article className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
            <SectionHeading eyebrow="Store health" title="Inventory tracker" description="Live availability across catalog options." />

            <div className="mt-4 flex items-center justify-between sm:hidden">
              <p className="text-[10px] font-medium text-muted-foreground">Swipe cards to inspect stock health</p>
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider">Slide →</span>
            </div>

            <div aria-label="Inventory metrics" className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 pr-8 scrollbar-hide sm:mt-6">
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

        <section aria-label="Shopping workspace" className="rounded-[2.25rem] border border-border/60 bg-card/45 p-3 shadow-lg sm:p-5">
          <div className="mb-4 flex flex-col gap-3 px-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/70">Shopping workspace</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Move products toward checkout</h2>
              <p className="mt-1 text-xs text-muted-foreground">Your cart and wishlist stay connected, so saved ideas can become active purchases.</p>
            </div>
            <Link href="/store" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">Discover products <ArrowRight className="size-3.5" /></Link>
          </div>

          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-8 scrollbar-hide lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0 lg:pr-0">
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
          </div>
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
      </div>
    </main>
  );
}

export default function CommerceDashboard(props: CommerceDashboardProps) {
  return <CommerceDashboardContent {...props} />;
}

type MobileInventory = { totalUnits: number; lowStockVariants: number; outOfStockVariants: number; inventoryValue: number; variantCount: number };

function MobileCommerceDashboard({ inventory, recentProducts, wishlistProducts, cartProducts, recommendations, shoppingListProducts, wishlistCount, cartCount, checkedOutCount, onDeliveryCount, totalSpent, orderCount }: { inventory: MobileInventory; recentProducts: ProductType[]; wishlistProducts: ProductType[]; cartProducts: ProductType[]; recommendations: ProductType[]; shoppingListProducts: ProductType[]; wishlistCount: number; cartCount: number; checkedOutCount: number; onDeliveryCount: number; totalSpent: number; orderCount: number }) {
  const smartPicks = recommendations.filter(product => product.featured || product.isNew).slice(0, 4);
  const stockHealth = inventory.variantCount ? Math.round(((inventory.variantCount - inventory.outOfStockVariants) / inventory.variantCount) * 100) : 0;
  return (
    <div className="space-y-5 sm:hidden">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-lg">
        <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-primary">Commerce pulse</p><h2 className="mt-1 text-lg font-black">Inventory & activity</h2></div><Link href="/orders" className="grid size-9 place-items-center rounded-full border border-border/60"><ChevronRight className="size-4" /></Link></div>
        <div className="mt-5 grid grid-cols-4 gap-2"><MobileRing label="Stock" value={`${stockHealth}%`} progress={stockHealth} tone="emerald" /><MobileRing label="Units" value={compactNumber(inventory.totalUnits)} progress={Math.min(inventory.totalUnits, 100)} tone="violet" /><MobileRing label="Orders" value={String(orderCount)} progress={Math.min(orderCount * 12, 100)} tone="amber" /><MobileRing label="Alerts" value={String(inventory.lowStockVariants + inventory.outOfStockVariants)} progress={Math.min((inventory.lowStockVariants + inventory.outOfStockVariants) * 14, 100)} tone="rose" /></div>
        <div className="mt-5 divide-y divide-border/50 rounded-2xl bg-muted/45 px-3"><MobileSignal icon={<WalletCards />} label="Lifetime commerce" helper={`${orderCount} completed activities`} value={compactCurrencyFormatter.format(totalSpent)} /><MobileSignal icon={<Boxes />} label="Catalog stock value" helper={`${inventory.variantCount} active options`} value={compactCurrencyFormatter.format(inventory.inventoryValue)} /><MobileSignal icon={<TriangleAlert />} label="Inventory attention" helper="Low and unavailable options" value={String(inventory.lowStockVariants + inventory.outOfStockVariants)} alert /></div>
      </section>

      <MobileBlock title="Commerce journey" subtitle="Swipe through each stage of your shopping flow">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-6 scrollbar-hide"><MobileStage icon={<Heart />} title="Wish listed" count={wishlistCount} products={wishlistProducts} href="/wishlist" tone="rose" /><MobileStage icon={<ShoppingBag />} title="Carted" count={cartCount} products={cartProducts} href="/cart" tone="emerald" /><MobileStage icon={<ClipboardCheck />} title="Checked out" count={checkedOutCount} products={[]} href="/orders" tone="violet" /><MobileStage icon={<Truck />} title="On delivery" count={onDeliveryCount} products={[]} href="/orders" tone="amber" /></div>
      </MobileBlock>

      <MobileBlock title="Discovery intelligence" subtitle="Your activity, recommendations, and smart selections">
        <div className="space-y-3"><MobileProductGroup icon={<Heart />} eyebrow="Your playlists" title="Shopping lists" products={shoppingListProducts} href="/settings" /><MobileProductGroup icon={<Eye />} eyebrow="Continue" title="Recently viewed" products={recentProducts} href="/store" /><MobileProductGroup icon={<Sparkles />} eyebrow="For you" title="Recommended" products={recommendations} href="/store" /><MobileProductGroup icon={<WandSparkles />} eyebrow="AJ intelligence" title="Smart picks" products={smartPicks.length ? smartPicks : recommendations} href="/ai" /></div>
      </MobileBlock>

      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[#07172b] p-5 text-white shadow-xl"><p className="text-[9px] font-black uppercase tracking-[.2em] text-amber-300">Store experience</p><div className="mt-2 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black">Keep discovering</h2><p className="mt-1 text-xs leading-5 text-white/60">Fresh products and moments chosen around your activity.</p></div><Link href="/store" className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#07172b]"><ArrowRight className="size-4" /></Link></div><div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-1 scrollbar-hide">{recommendations.slice(0, 4).map(product => <MobileProductTile key={product.id} product={product} dark />)}</div></section>
    </div>
  );
}

function MobileBlock({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <section className="rounded-[2rem] border border-border/60 bg-card/75 p-4 shadow-lg"><div className="mb-4"><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{subtitle}</p></div>{children}</section>; }
function MobileRing({ label, value, progress, tone }: { label: string; value: string; progress: number; tone: Tone }) { const color = tone === 'emerald' ? '#10b981' : tone === 'violet' ? '#8b5cf6' : tone === 'amber' ? '#f59e0b' : '#f43f5e'; return <div className="min-w-0 text-center"><div className="relative mx-auto grid size-14 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${Math.max(progress, 4)}%, hsl(var(--muted)) 0)` }}><div className="grid size-11 place-items-center rounded-full bg-card text-[11px] font-black">{value}</div></div><p className="mt-2 truncate text-[9px] font-semibold text-muted-foreground">{label}</p></div>; }
function MobileSignal({ icon, label, helper, value, alert = false }: { icon: ReactNode; label: string; helper: string; value: string; alert?: boolean }) { return <div className="flex items-center gap-3 py-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-background text-primary [&_svg]:size-4">{icon}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{label}</p><p className="mt-0.5 truncate text-[9px] text-muted-foreground">{helper}</p></div><span className={cn('shrink-0 text-xs font-black', alert && 'text-rose-500')}>{value}</span></div>; }
function MobileStage({ icon, title, count, products, href, tone }: { icon: ReactNode; title: string; count: number; products: ProductType[]; href: string; tone: Tone }) { return <Link href={href} className="w-[72vw] max-w-64 shrink-0 snap-start rounded-3xl border border-border/55 bg-background/70 p-4"><div className="flex items-center justify-between"><span className={cn('grid size-10 place-items-center rounded-2xl [&_svg]:size-4', toneStyles[tone])}>{icon}</span><span className="text-2xl font-black">{count}</span></div><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-1 text-[9px] text-muted-foreground">Products at this stage</p><div className="mt-4 flex -space-x-2">{products.slice(0, 4).map(product => { const variant = product.variants[0]; return <span key={product.id} className="relative size-9 overflow-hidden rounded-full border-2 border-background bg-muted">{variant ? <Image src={variant.image} alt="" fill sizes="36px" className="object-cover" /> : null}</span>; })}{!products.length ? <span className="inline-flex h-9 items-center rounded-full bg-muted px-3 text-[9px] font-semibold">View activity</span> : null}</div></Link>; }
function MobileProductGroup({ icon, eyebrow, title, products, href }: { icon: ReactNode; eyebrow: string; title: string; products: ProductType[]; href: string }) { return <article className="overflow-hidden rounded-3xl bg-muted/45 p-3"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-background text-primary [&_svg]:size-4">{icon}</span><div className="min-w-0 flex-1"><p className="text-[8px] font-bold uppercase tracking-[.16em] text-muted-foreground">{eyebrow}</p><h3 className="mt-0.5 text-sm font-black">{title}</h3></div><Link href={href} className="grid size-8 place-items-center rounded-full bg-background"><ChevronRight className="size-4" /></Link></div><div className="mt-3 flex snap-x gap-2 overflow-x-auto scrollbar-hide">{products.slice(0, 4).map(product => <MobileProductTile key={product.id} product={product} />)}{!products.length ? <p className="py-4 text-[10px] text-muted-foreground">This section grows as you shop.</p> : null}</div></article>; }
function MobileProductTile({ product, dark = false }: { product: ProductType; dark?: boolean }) { const variant = product.variants.find(item => item.stockLeft > 0) ?? product.variants[0]; return <Link href={`/products/${product.slug}`} className="w-28 shrink-0 snap-start"><div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">{variant ? <Image src={variant.image} alt={product.name} fill sizes="112px" className="object-cover" /> : null}</div><p className={cn('mt-2 truncate text-[10px] font-bold', dark && 'text-white')}>{product.name}</p><p className={cn('mt-0.5 text-[9px]', dark ? 'text-white/55' : 'text-muted-foreground')}>{variant ? compactCurrencyFormatter.format(variant.price) : 'Unavailable'}</p></Link>; }
function compactNumber(value: number) { return new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(value); }

function MetricCard({ icon, label, value, helper, tone }: { icon: ReactNode; label: string; value: string; helper: string; tone: Tone }) {
  return (
    <article className="group w-[72vw] max-w-64 shrink-0 snap-start rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto sm:max-w-none sm:p-5">
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
    <div className="group flex h-full w-11 shrink-0 snap-start flex-col justify-end text-center sm:w-auto sm:min-w-0">
      <span className="mb-2 truncate text-[9px] font-semibold opacity-0 transition group-hover:opacity-100 sm:text-[10px]">{compactCurrencyFormatter.format(value)}</span>
      <div className="relative mx-auto flex h-48 w-full max-w-10 items-end overflow-hidden rounded-xl bg-muted/60 p-1 sm:h-52">
        <div className={cn('w-full rounded-lg transition-all duration-500 group-hover:brightness-110', planned ? 'bg-primary' : 'bg-foreground/80')} style={{ height: `${height}%` }} />
      </div>
      <span className={cn('mt-2 truncate text-[9px] sm:text-[10px]', planned ? 'font-bold text-primary' : 'text-muted-foreground')}>{label}</span>
    </div>
  );
}

function ProductSection({ eyebrow, title, description, products, emptyMessage, featured = false, compact = false, journeyPeer = false }: { eyebrow: string; title: string; description: string; products: ProductType[]; emptyMessage: string; featured?: boolean; compact?: boolean; journeyPeer?: boolean }) {
  return (
    <section className={cn('rounded-[2rem] border border-border/60 bg-card/60 p-5 shadow-lg sm:p-6', journeyPeer && 'w-[88vw] max-w-2xl shrink-0 snap-start sm:w-[78vw] xl:w-auto xl:max-w-none')}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} actionHref="/store" actionLabel="Explore store" />
      {products.length ? (
        <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 pr-6 scrollbar-hide">
          {products.slice(0, compact ? 3 : 6).map(product => (
            <div key={product.id} className={cn('shrink-0 snap-start', compact ? 'w-36 sm:w-40' : featured ? 'w-40 sm:w-44 xl:w-48' : 'w-40 sm:w-44')}>
              <DashboardProductCard product={product} />
            </div>
          ))}
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
        <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-black shadow-sm">{variant ? compactCurrencyFormatter.format(variant.price) : 'N/A'}</span>
        <span className="absolute bottom-2 right-2 grid size-8 translate-y-1 place-items-center rounded-full bg-primary text-primary-foreground opacity-90 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:scale-105 group-hover:opacity-100"><ArrowRight className="size-3.5" /></span>
      </div>
      <p className="mt-2 truncate text-xs font-semibold">{product.name}</p>
      <p className="mt-1 truncate text-[10px] capitalize text-muted-foreground">{product.category.replaceAll('-', ' ')}</p>
    </Link>
  );
}

function ShoppingListCard({ icon, eyebrow, title, count, products, href, emptyMessage }: { icon: ReactNode; eyebrow: string; title: string; count: number; products: ProductType[]; href: string; emptyMessage: string }) {
  const uniqueProducts = Array.from(new Map(products.map(product => [product.id, product])).values()).slice(0, 4);

  return (
    <article className="w-[86vw] max-w-md shrink-0 snap-start rounded-[2rem] border border-border/60 bg-card/70 p-4 shadow-lg sm:p-6 lg:w-auto lg:max-w-none">
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
  return <div className="flex min-h-24 w-[78vw] max-w-72 shrink-0 snap-start flex-col justify-between rounded-2xl border border-border/50 bg-background/70 p-4 shadow-sm sm:min-h-0 sm:w-64 sm:max-w-none sm:flex-row sm:items-center sm:gap-3"><div className="flex items-center justify-between sm:contents"><div className={cn('grid size-10 place-items-center rounded-xl [&_svg]:size-4', toneStyles[tone])}>{icon}</div><span className="text-lg font-bold sm:order-3 sm:text-sm">{value}</span></div><span className="mt-3 min-w-0 flex-1 truncate text-xs text-muted-foreground sm:mt-0">{label}</span></div>;
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-full border border-border/60 bg-background/65 px-3 py-2"><span className="text-[9px] text-muted-foreground">{label}</span><span className="ml-2 text-[10px] font-bold uppercase">{value}</span></div>;
}

function RelationshipPill({ label, value }: { label: string; value: number }) {
  return <div className="flex shrink-0 snap-start items-center gap-2 rounded-full border border-border/60 bg-background/65 px-3 py-2 text-[10px]"><span className="text-muted-foreground">{label}</span><span className="grid min-w-5 place-items-center rounded-full bg-foreground px-1.5 py-0.5 font-bold text-background">{value}</span></div>;
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
