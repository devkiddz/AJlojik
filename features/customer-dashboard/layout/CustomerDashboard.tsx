'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { ReactNode } from 'react';

import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Crown,
  Heart,
  History,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Star,
  Truck
} from 'lucide-react';

import { WorkspaceSwitcher } from '@/features/workspace';

import { cn } from '@/lib/utils';

import type {
  CommerceDashboardData,
  CommerceOrder,
  CommerceProduct
} from '../contracts/customerDashboardTypes';

import { useCustomerDashboard } from '../providers/CustomerDashboardProvider';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

const compactMoneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1
});

const activeDeliveryStatuses = new Set([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY'
]);

const processingOrderStatuses = new Set([
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY'
]);

const processedOrderStatuses = new Set(['DELIVERED', 'COMPLETED']);

type JourneyTone = 'slate' | 'violet' | 'amber' | 'rose' | 'emerald';

const journeyToneStyles = {
  slate: {
    shell: 'border-slate-500/15 bg-gradient-to-br from-slate-500/10 via-card to-card',

    icon: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',

    label: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',

    accent: 'bg-slate-500'
  },

  violet: {
    shell: 'border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card to-card',

    icon: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',

    label: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',

    accent: 'bg-violet-500'
  },

  amber: {
    shell: 'border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card',

    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',

    label: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',

    accent: 'bg-amber-500'
  },

  rose: {
    shell: 'border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card',

    icon: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',

    label: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',

    accent: 'bg-rose-500'
  },

  emerald: {
    shell: 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card',

    icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',

    label: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',

    accent: 'bg-emerald-500'
  }
} satisfies Record<
  JourneyTone,
  {
    shell: string;
    icon: string;
    label: string;
    accent: string;
  }
>;

export default function CustomerDashboard() {
  const { dashboard } = useCustomerDashboard();

  const { data, mixes } = dashboard;

  const activeDeliveries = data.orders.filter(order => {
    const status = order.delivery?.status ?? order.status;

    return activeDeliveryStatuses.has(status.toUpperCase());
  });

  const recentProductIds = new Set(data.recentProducts.map(product => product.id));

  const cartProductIds = new Set(data.cartItems.map(item => item.product.id));

  const wishlistProductIds = new Set(data.wishlistProducts.map(product => product.id));

  const suggestedMix =
    mixes.find(mix => /suggest|similar|recommend/i.test(`${mix.id} ${mix.title}`)) ?? mixes[0];

  const suggestedProducts = uniqueProducts([...(suggestedMix?.products ?? []), ...data.catalog])
    .filter(
      product =>
        !recentProductIds.has(product.id) &&
        !cartProductIds.has(product.id) &&
        !wishlistProductIds.has(product.id)
    )
    .slice(0, 8);

  const suggestedProductIds = new Set(suggestedProducts.map(product => product.id));

  const pickedMix =
    mixes.find(
      mix => mix.id !== suggestedMix?.id && /picked|personal|for you/i.test(`${mix.id} ${mix.title}`)
    ) ?? mixes.find(mix => mix.id !== suggestedMix?.id);

  const pickedProducts = uniqueProducts([
    ...data.wishlistProducts,
    ...(pickedMix?.products ?? []),
    ...data.catalog
  ])
    .filter(
      product =>
        !recentProductIds.has(product.id) &&
        !cartProductIds.has(product.id) &&
        !suggestedProductIds.has(product.id)
    )
    .slice(0, 8);

  return (
    <main className="h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-muted/20">
      <div className="mx-auto w-full max-w-[92rem] space-y-4 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
        <WelcomeBar />

        <section
          id="experience-journey"
          className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm">
          <header className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <History className="size-4" />
              </span>

              <h2 className="text-lg font-bold sm:text-xl">Your Experience Journey</h2>
            </div>

            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
              EJ
            </span>
          </header>

          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 py-4 scrollbar-hide sm:px-5">
            <JourneyListCard
              code="RV"
              title="Recent Views"
              count={data.recentProducts.length}
              href="/store?view=recent"
              icon={<Clock3 />}
              tone="slate">
              <RecentViewRows products={data.recentProducts} />
            </JourneyListCard>

            <JourneyListCard
              id="activity-archive"
              code="AA"
              title="Activity Archive"
              count={data.history.length}
              href="/store?view=history"
              icon={<History />}
              tone="rose">
              <ActivityRows history={data.history} />
            </JourneyListCard>

            <JourneyListCard
              code="OH"
              title="Order History"
              count={data.orders.length}
              href="/orders"
              icon={<ReceiptText />}
              tone="violet">
              <OrderRows orders={data.orders} />
            </JourneyListCard>

            <JourneyListCard
              code="OD"
              title="On Delivery"
              count={activeDeliveries.length}
              href="/orders?status=active"
              icon={<Truck />}
              tone="emerald">
              <DeliveryRows orders={activeDeliveries} />
            </JourneyListCard>

            <JourneyListCard
              code="CT"
              title="Cart"
              count={data.pulse.cartQuantity}
              href="/cart"
              icon={<ShoppingBag />}
              tone="amber">
              <CartRows items={data.cartItems} subtotal={data.pulse.cartSubtotal} />
            </JourneyListCard>
          </div>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-2">
          <ProductExperience
            code="SP"
            title="Suggested Products"
            icon={<PackageCheck />}
            products={suggestedProducts}
            href={suggestedMix?.href ?? '/store'}
          />

          <ProductExperience
            code="PFY"
            title="Picked for You"
            icon={<Heart />}
            products={pickedProducts}
            href={pickedMix?.href ?? '/store'}
          />
        </section>

        <div className="h-24 lg:h-12" />
      </div>
    </main>
  );
}

function WelcomeBar() {
  const { dashboard } = useCustomerDashboard();

  const { data } = dashboard;

  const firstName = data.identity.firstName || data.identity.name.split(' ')[0] || 'Customer';

  const membership = data.identity.tier || 'Member';

  return (
    <section className="relative z-30 overflow-visible rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="absolute -bottom-24 left-1/3 size-56 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-foreground text-base font-bold text-background shadow-sm sm:size-14">
            {data.identity.image ? (
              <Image
                src={data.identity.image}
                alt={data.identity.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              data.identity.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">Customer dashboard</p>

            <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl">Welcome, {firstName}</h1>
          </div>
        </div>

        <div className="relative z-50 grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <div
            className="
              relative z-50
              col-span-2
              min-w-0
              sm:col-span-1

              [&>button]:h-10
              [&>button]:w-full
              [&>button]:max-w-full
              [&>button]:rounded-xl
              [&>button]:border
              [&>button]:border-border/60
              [&>button]:bg-background
              [&>button]:px-3.5
              [&>button]:text-xs
              [&>button]:font-semibold
              [&>button]:shadow-none

              sm:[&>button]:w-auto
            ">
            <WorkspaceSwitcher />
          </div>

          <HeaderChip icon={<Crown />} label="Membership" value={membership} />

          <Link
            href="#activity-archive"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3.5 text-xs font-semibold transition hover:border-primary/25 hover:bg-muted">
            <History className="size-4" />
            History
          </Link>

          <Link
            href="/store"
            className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition hover:bg-foreground/90 sm:col-span-1">
            <ArrowLeft className="size-4" />
            Back to store
          </Link>
        </div>
      </div>
    </section>
  );
}

function HeaderChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3.5">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>

      <span className="hidden text-xs text-muted-foreground sm:inline">{label}</span>

      <span className="break-words text-xs font-semibold capitalize">{value}</span>
    </div>
  );
}

function JourneyGroup({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
        <h3 className="text-sm font-bold">{title}</h3>

        <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">{code}</span>
      </header>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-3 scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible">
        {children}
      </div>
    </section>
  );
}

function JourneyListCard({
  id,
  code,
  title,
  count,
  href,
  icon,
  tone,
  children
}: {
  id?: string;
  code: string;
  title: string;
  count: number;
  href: string;
  icon: ReactNode;
  tone: JourneyTone;
  children: ReactNode;
}) {
  const style = journeyToneStyles[tone];

  return (
    <article
      id={id}
      className={cn(
        'relative flex min-h-64 w-72 shrink-0 snap-start flex-col overflow-hidden rounded-xl border p-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg',
        style.shell
      )}>
      <span className={cn('absolute inset-x-0 top-0 h-0.5', style.accent)} />

      <header className="flex items-start gap-3">
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-4', style.icon)}>
          {icon}
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="break-words text-sm font-bold leading-5">{title}</h4>

          <span className={cn('mt-1 inline-flex rounded-md px-1.5 py-0.5 text-xs font-bold', style.label)}>
            {code}
          </span>
        </div>

        <span className="shrink-0 text-2xl font-bold">{count}</span>
      </header>

      <div className="mt-3 space-y-1.5">{children}</div>

      <Link
        href={href}
        className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
        View all
        <ArrowUpRight className="size-3.5" />
      </Link>
    </article>
  );
}

function RecentViewRows({ products }: { products: CommerceProduct[] }) {
  const visibleProducts = products.slice(0, 3);

  if (visibleProducts.length === 0) {
    return <EmptyJourneyRows label="No recent views" />;
  }

  return visibleProducts.map((product, index) => (
    <MiniRecord
      key={product.id}
      href={`/products/${product.slug}`}
      leading={<ProductAvatar product={product} />}
      title={product.name}
      trailing={formatIndex(index)}
    />
  ));
}

function ActivityRows({ history }: { history: CommerceDashboardData['history'] }) {
  const visibleHistory = history.slice(0, 3);

  if (visibleHistory.length === 0) {
    return <EmptyJourneyRows label="No archived activity" />;
  }

  return visibleHistory.map((entry, index) => {
    const label = resolveActivityLabel(entry);

    return (
      <MiniRecord
        key={`${label}-${index}`}
        leading={<RecordLabel>{abbreviate(label)}</RecordLabel>}
        title={label}
        trailing={formatIndex(index)}
      />
    );
  });
}

function OrderRows({ orders }: { orders: CommerceOrder[] }) {
  const visibleOrders = orders.slice(0, 3);

  if (visibleOrders.length === 0) {
    return <EmptyJourneyRows label="No order history" />;
  }

  return visibleOrders.map(order => {
    const status = resolveOrderStatus(order.status);

    return (
      <MiniRecord
        key={order.id}
        href={`/orders?order=${order.id}`}
        leading={<RecordLabel>{orderCode(order.orderNumber)}</RecordLabel>}
        title={order.orderNumber}
        subtitle={formatLabel(order.status)}
        subtitleClassName={status.text}
        trailing={compactMoneyFormatter.format(order.total)}
        indicatorClassName={status.dot}
      />
    );
  });
}

function DeliveryRows({ orders }: { orders: CommerceOrder[] }) {
  const visibleOrders = orders.slice(0, 3);

  if (visibleOrders.length === 0) {
    return <EmptyJourneyRows label="No active delivery" />;
  }

  return visibleOrders.map(order => {
    const status = order.delivery?.status ?? order.status;

    const progress = resolveDeliveryProgress(status);

    return (
      <Link
        key={order.id}
        href={`/orders?order=${order.id}`}
        className="block rounded-lg border border-border/50 bg-background/65 p-2.5 transition hover:border-primary/25 hover:bg-background">
        <div className="flex items-center gap-2">
          <RecordLabel>{orderCode(order.orderNumber)}</RecordLabel>

          <div className="min-w-0 flex-1">
            <p className="break-words text-xs font-semibold leading-4">{order.orderNumber}</p>

            <p className="mt-0.5 break-words text-xs text-muted-foreground">{formatLabel(status)}</p>
          </div>

          <span className="shrink-0 text-xs font-bold">{progress}%</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60">
          <span
            className="block h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${progress}%`
            }}
          />
        </div>
      </Link>
    );
  });
}

function CartJourneyCard({
  items,
  quantity,
  subtotal
}: {
  items: CommerceDashboardData['cartItems'];
  quantity: number;
  subtotal: number;
}) {
  const visibleItems = items.slice(0, 3);

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
          <ShoppingBag className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-bold">Shopping Continuation</h3>

          <span className="text-xs font-medium text-muted-foreground">Cart · CT</span>
        </div>

        <div className="shrink-0 text-right">
          <span className="block text-2xl font-bold">{quantity}</span>

          <span className="text-xs font-semibold text-muted-foreground">
            {compactMoneyFormatter.format(subtotal)}
          </span>
        </div>
      </header>

      <div className="p-3 sm:p-4">
        {visibleItems.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {visibleItems.map(item => {
              const quantity = resolveCartItemQuantity(item);

              return (
                <Link
                  key={item.product.id}
                  href={`/products/${item.product.slug}`}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-background/70 p-2.5 transition hover:border-primary/25 hover:bg-background">
                  <ProductAvatar product={item.product} />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-xs font-semibold leading-4">
                      {item.product.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">
                        {compactMoneyFormatter.format(item.product.price)}
                      </span>

                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-bold text-muted-foreground">
                        ×{quantity}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyJourneyRows label="Your cart is empty" />
        )}

        <Link
          href="/cart"
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background transition hover:bg-foreground/90">
          Open cart
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

function CartRows({ items, subtotal }: { items: CommerceDashboardData['cartItems']; subtotal: number }) {
  const visibleItems = items.slice(0, 3);

  if (visibleItems.length === 0) {
    return <EmptyJourneyRows label="Your cart is empty" />;
  }

  return (
    <>
      {visibleItems.map(item => (
        <MiniRecord
          key={item.product.id}
          href={`/products/${item.product.slug}`}
          leading={<ProductAvatar product={item.product} />}
          title={item.product.name}
          subtitle={`Qty ${resolveCartItemQuantity(item)}`}
          trailing={compactMoneyFormatter.format(item.product.price)}
        />
      ))}

      <div className="flex items-center justify-between rounded-lg border border-amber-500/15 bg-background/70 px-2.5 py-2 text-xs">
        <span className="font-medium text-muted-foreground">Total</span>

        <span className="font-bold">{compactMoneyFormatter.format(subtotal)}</span>
      </div>
    </>
  );
}

function MiniRecord({
  leading,
  title,
  subtitle,
  trailing,
  href,
  subtitleClassName,
  indicatorClassName
}: {
  leading: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: string;
  href?: string;
  subtitleClassName?: string;
  indicatorClassName?: string;
}) {
  const content = (
    <>
      {leading}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          {indicatorClassName ? (
            <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', indicatorClassName)} />
          ) : null}

          <p className="break-words text-xs font-semibold leading-4">{title}</p>
        </div>

        {subtitle ? (
          <p className={cn('mt-0.5 break-words text-xs leading-4 text-muted-foreground', subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {trailing ? (
        <span className="max-w-20 shrink-0 break-words text-right text-xs font-bold text-muted-foreground">
          {trailing}
        </span>
      ) : null}
    </>
  );

  const className =
    'flex min-w-0 items-center gap-2.5 rounded-lg border border-border/50 bg-background/65 p-2 transition hover:border-primary/25 hover:bg-background';

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function ProductExperience({
  code,
  title,
  icon,
  products,
  href
}: {
  code: string;
  title: string;
  icon: ReactNode;
  products: CommerceProduct[];
  href: string;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">
            {icon}
          </span>

          <div className="min-w-0">
            <h2 className="break-words text-lg font-bold leading-6 sm:text-xl">{title}</h2>
          </div>

          <ProductAvatarStack products={products} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-lg bg-muted px-2 py-1 text-xs font-bold text-muted-foreground sm:inline-flex">
            {code}
          </span>

          <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">{products.length}</span>

          <Link
            href={href}
            aria-label={`View all ${title}`}
            className="grid size-8 place-items-center rounded-xl border border-border/60 bg-background transition hover:border-primary/25 hover:bg-muted">
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      {products.length > 0 ? (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4 scrollbar-hide sm:px-5">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} position={index + 1} />
          ))}
        </div>
      ) : (
        <EmptyProductShelf href={href} />
      )}
    </section>
  );
}

function ProductCard({ product, position }: { product: CommerceProduct; position: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg sm:w-44">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="176px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <ShoppingBag className="size-5 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

        <span className="absolute left-2 top-2 rounded-lg bg-background/90 px-2 py-1 text-xs font-bold shadow-sm backdrop-blur">
          {String(position).padStart(2, '0')}
        </span>

        <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-xl bg-background/90 shadow-sm backdrop-blur">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="p-3">
        <p className="line-clamp-2 break-words text-sm font-semibold leading-5">{product.name}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="min-w-0 break-words text-sm font-bold">
            {moneyFormatter.format(product.price)}
          </span>

          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Star className="size-3 fill-current text-amber-500" />

            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductAvatar({ product }: { product: CommerceProduct }) {
  return (
    <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
      {product.image ? (
        <Image src={product.image} alt="" fill sizes="36px" className="object-cover" />
      ) : (
        <span className="grid size-full place-items-center">
          <ShoppingBag className="size-3.5 text-muted-foreground" />
        </span>
      )}
    </span>
  );
}

function ProductAvatarStack({ products }: { products: CommerceProduct[] }) {
  const visibleProducts = products.slice(0, 3);

  const remaining = Math.max(products.length - visibleProducts.length, 0);

  if (products.length === 0) {
    return (
      <div className="hidden -space-x-2 sm:flex">
        {Array.from({
          length: 3
        }).map((_, index) => (
          <span
            key={index}
            className="grid size-8 place-items-center rounded-full border-2 border-card bg-muted shadow-sm">
            {index === 2 ? <span className="text-xs font-bold text-muted-foreground">0</span> : null}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden shrink-0 -space-x-2 sm:flex">
      {visibleProducts.map(product => (
        <span
          key={product.id}
          className="relative size-8 overflow-hidden rounded-full border-2 border-card bg-muted shadow-sm">
          {product.image ? (
            <Image src={product.image} alt="" fill sizes="32px" className="object-cover" />
          ) : null}
        </span>
      ))}

      {remaining > 0 ? (
        <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-muted text-xs font-bold text-muted-foreground shadow-sm">
          +{remaining}
        </span>
      ) : null}
    </div>
  );
}

function RecordLabel({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
      {children}
    </span>
  );
}

function EmptyJourneyRows({ label }: { label: string }) {
  return (
    <div className="grid min-h-28 place-items-center rounded-lg border border-dashed border-border/60 bg-background/35 p-3">
      <div className="text-center">
        <span className="block text-2xl font-bold">0</span>

        <span className="mt-1 block break-words text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function EmptyProductShelf({ href }: { href: string }) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
        <div className="flex gap-2">
          {Array.from({
            length: 3
          }).map((_, index) => (
            <span
              key={index}
              className="grid size-12 place-items-center rounded-xl border border-border/60 bg-background">
              <ShoppingBag className="size-4 text-muted-foreground" />
            </span>
          ))}
        </div>

        <div className="text-right">
          <span className="block text-2xl font-bold">0</span>

          <Link
            href={href}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
            Explore
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function resolveOrderStatus(status: string): {
  text: string;
  dot: string;
} {
  const normalized = status.toUpperCase();

  if (processedOrderStatuses.has(normalized)) {
    return {
      text: 'text-emerald-600 dark:text-emerald-300',

      dot: 'bg-emerald-500'
    };
  }

  if (processingOrderStatuses.has(normalized)) {
    return {
      text: 'text-orange-600 dark:text-orange-300',

      dot: 'bg-orange-500'
    };
  }

  return {
    text: 'text-red-600 dark:text-red-300',

    dot: 'bg-red-500'
  };
}

function resolveDeliveryProgress(status: string): number {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 10;

    case 'CONFIRMED':
      return 20;

    case 'PROCESSING':
      return 35;

    case 'PACKED':
      return 50;

    case 'SHIPPED':
      return 65;

    case 'IN_TRANSIT':
      return 80;

    case 'OUT_FOR_DELIVERY':
      return 90;

    case 'DELIVERED':
    case 'COMPLETED':
      return 100;

    default:
      return 0;
  }
}

function resolveActivityLabel(entry: unknown): string {
  const value = readTextValue(entry, ['title', 'label', 'action', 'source', 'type']);

  return value ? formatLabel(value) : 'Activity';
}

function resolveCartItemQuantity(item: unknown): number {
  const quantity = readNumberValue(item, ['quantity', 'qty', 'count']);

  return Math.max(quantity ?? 1, 1);
}

function readTextValue(value: unknown, keys: string[]): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}

function readNumberValue(value: unknown, keys: string[]): number | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function orderCode(orderNumber: string): string {
  const cleaned = orderNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  return cleaned.slice(-3) || 'ORD';
}

function abbreviate(value: string): string {
  const words = value.replaceAll('_', ' ').replaceAll('-', ' ').trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return '—';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}

function formatLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
}

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function uniqueProducts(products: CommerceProduct[]): CommerceProduct[] {
  const resolved = new Map<string, CommerceProduct>();

  products.forEach(product => {
    if (!resolved.has(product.id)) {
      resolved.set(product.id, product);
    }
  });

  return Array.from(resolved.values());
}
