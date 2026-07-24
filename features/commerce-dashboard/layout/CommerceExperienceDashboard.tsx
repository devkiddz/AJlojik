'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Bot,
  ChevronRight,
  Clock3,
  Heart,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  WalletCards,
  X
} from 'lucide-react';

import type { ReactNode } from 'react';

import SignOutButton from '@/components/auth/SignOutButton';
import { WorkspaceSwitcher } from '@/features/workspace';
import { cn } from '@/lib/utils';

import type {
  CommerceJourneyItem,
  CommerceMix,
  CommerceOrder,
  CommercePriorityExperience,
  CommerceProduct,
  CommercePulseItem
} from '../contracts/commerceDashboardTypes';

import { useCommerceExperience } from '../providers/CommerceExperienceProvider';

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1
});

const priorityToneStyles = {
  navy: {
    shell: 'bg-slate-950 text-white',
    glow: 'bg-sky-400/20',
    badge: 'border-sky-300/20 bg-sky-300/10 text-sky-100',
    action: 'bg-white text-slate-950 hover:bg-white/90'
  },

  wine: {
    shell: 'bg-gradient-to-br from-rose-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-rose-400/20',
    badge: 'border-rose-300/20 bg-rose-300/10 text-rose-100',
    action: 'bg-white text-rose-950 hover:bg-white/90'
  },

  gold: {
    shell: 'bg-gradient-to-br from-amber-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-amber-300/20',
    badge: 'border-amber-200/20 bg-amber-200/10 text-amber-100',
    action: 'bg-amber-100 text-amber-950 hover:bg-amber-50'
  },

  emerald: {
    shell: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-emerald-300/20',
    badge: 'border-emerald-200/20 bg-emerald-200/10 text-emerald-100',
    action: 'bg-emerald-100 text-emerald-950 hover:bg-emerald-50'
  },

  violet: {
    shell: 'bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950 text-white',
    glow: 'bg-violet-300/20',
    badge: 'border-violet-200/20 bg-violet-200/10 text-violet-100',
    action: 'bg-violet-100 text-violet-950 hover:bg-violet-50'
  }
} satisfies Record<
  CommercePriorityExperience['tone'],
  {
    shell: string;
    glow: string;
    badge: string;
    action: string;
  }
>;

const journeyToneStyles = {
  navy: 'from-sky-500/15 via-slate-950/5 to-transparent',

  wine: 'from-rose-500/15 via-slate-950/5 to-transparent',

  gold: 'from-amber-400/20 via-slate-950/5 to-transparent',

  emerald: 'from-emerald-400/15 via-slate-950/5 to-transparent',

  violet: 'from-violet-400/15 via-slate-950/5 to-transparent'
} satisfies Record<CommerceJourneyItem['tone'], string>;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatStatus(value: string): string {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
}

export default function CommerceExperienceDashboard() {
  const { experience } = useCommerceExperience();

  const { data, greeting, priority, pulse, journeys, mixes } = experience;

  return (
    <main className="relative h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-40 size-96 rounded-full bg-rose-700/10 blur-3xl" />
        <div className="absolute -left-40 top-1/3 size-96 rounded-full bg-sky-700/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <CommerceIdentityHeader greeting={greeting} />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.75fr)]">
          <PriorityExperienceCard priority={priority} />

          <CommercePulse items={pulse} totalSpent={data.pulse.totalSpent} />
        </section>

        {journeys.length > 0 ? <JourneySection journeys={journeys} /> : null}

        {mixes.map(mix => (
          <CommerceMixSection key={mix.id} mix={mix} />
        ))}

        <RecentOrdersSection orders={data.orders} />

        <CommerceClosingPanel />

        <div className="h-24 lg:h-12" />
      </div>

      <CommerceAssistantDock />
    </main>
  );
}

function CommerceIdentityHeader({ greeting }: { greeting: string }) {
  const { experience } = useCommerceExperience();

  const { data } = experience;

  return (
    <header className="glass-surface-strong relative z-40 rounded-3xl border border-border/60 p-4 shadow-xl sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 size-48 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-lg font-black text-white shadow-xl sm:size-16">
            {data.identity.image ? (
              <Image
                src={data.identity.image}
                alt={data.identity.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              data.identity.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Personal commerce world
              </p>

              {data.identity.emailVerified ? <BadgeCheck className="size-4 text-emerald-500" /> : null}
            </div>

            <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-4xl">
              {greeting}, {data.identity.firstName}
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
              Your purchases, plans, discoveries and active moments are assembled here.
            </p>
          </div>
        </div>

        <div className="relative z-50 flex flex-wrap items-center gap-2">
          <WorkspaceSwitcher />

          <StatusChip label="Experience" value={data.profile.persona.replaceAll('-', ' ')} />

          <StatusChip label="Tier" value={data.identity.tier} />

          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

function PriorityExperienceCard({ priority }: { priority: CommercePriorityExperience }) {
  const tone = priorityToneStyles[priority.tone];

  return (
    <article
      className={cn(
        'group relative min-h-96 overflow-hidden rounded-3xl border border-white/10 shadow-2xl',
        tone.shell
      )}>
      {priority.image ? (
        <Image
          src={priority.image}
          alt=""
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 70vw"
          className="object-cover opacity-35 transition duration-700 group-hover:scale-105"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

      <div className={cn('absolute -right-20 -top-20 size-72 rounded-full blur-3xl', tone.glow)} />

      <div className="relative flex min-h-96 flex-col justify-between p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              'rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em]',
              tone.badge
            )}>
            {priority.statusLabel ?? 'YOUR MOMENT'}
          </span>

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Priority experience
          </span>
        </div>

        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
            {priority.eyebrow}
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {priority.title}
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            {priority.description}
          </p>

          {priority.progress != null ? (
            <div className="mt-6 max-w-xl">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/55">
                <span>Journey progress</span>
                <span>{priority.progress}%</span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${priority.progress}%`
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={priority.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-black transition hover:-translate-y-0.5',
                tone.action
              )}>
              {priority.actionLabel}
              <ArrowRight className="size-4" />
            </Link>

            {priority.secondaryHref && priority.secondaryActionLabel ? (
              <Link
                href={priority.secondaryHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10">
                {priority.secondaryActionLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function CommercePulse({ items, totalSpent }: { items: CommercePulseItem[]; totalSpent: number }) {
  const icons: Record<CommercePulseItem['id'], ReactNode> = {
    purchases: <ReceiptText className="size-4" />,
    saved: <Heart className="size-4" />,
    cart: <ShoppingBag className="size-4" />,
    reviews: <Star className="size-4" />
  };

  return (
    <aside className="premium-card flex min-h-96 flex-col rounded-3xl border border-border/60 p-5 shadow-xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">Commerce pulse</p>

          <h2 className="mt-2 text-2xl font-black tracking-tight">Your world at a glance</h2>
        </div>

        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <WalletCards className="size-5" />
        </span>
      </div>

      <div className="mt-6 rounded-3xl bg-foreground p-5 text-background shadow-lg">
        <p className="text-[10px] uppercase tracking-[0.18em] text-background/55">Recorded purchases</p>

        <p className="mt-2 text-3xl font-black tracking-tight">
          {compactCurrencyFormatter.format(totalSpent)}
        </p>

        <p className="mt-2 text-[10px] leading-4 text-background/55">
          Paid commerce inside the active workspace.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-muted text-primary">
                {icons[item.id]}
              </span>

              <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </div>

            <p className="mt-4 text-2xl font-black">{item.value}</p>

            <p className="mt-1 text-xs font-bold">{item.label}</p>

            <p className="mt-1 truncate text-[9px] text-muted-foreground">{item.helper}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function JourneySection({ journeys }: { journeys: CommerceJourneyItem[] }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/45 p-3 shadow-lg sm:p-5">
      <SectionHeader
        eyebrow="Continue your journey"
        title="Nothing meaningful gets lost"
        description="Return to the moments, products and actions that still matter."
        href="/store"
        actionLabel="Explore store"
      />

      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-8 scrollbar-hide">
        {journeys.map(journey => (
          <JourneyCard key={journey.id} journey={journey} />
        ))}
      </div>
    </section>
  );
}

function JourneyCard({ journey }: { journey: CommerceJourneyItem }) {
  return (
    <Link
      href={journey.href}
      className="group relative min-h-64 w-[82vw] max-w-sm shrink-0 snap-start overflow-hidden rounded-3xl border border-border/60 bg-card shadow-lg sm:w-96">
      {journey.image ? (
        <Image
          src={journey.image}
          alt=""
          fill
          sizes="384px"
          className="object-cover opacity-45 transition duration-700 group-hover:scale-105"
        />
      ) : null}

      <div className={cn('absolute inset-0 bg-gradient-to-br', journeyToneStyles[journey.tone])} />

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/20" />

      <div className="relative flex min-h-64 flex-col justify-between p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider backdrop-blur">
            {journey.badge ?? 'CONTINUE'}
          </span>

          <span className="grid size-9 place-items-center rounded-full bg-foreground text-background transition group-hover:scale-105">
            <ArrowRight className="size-4" />
          </span>
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">{journey.eyebrow}</p>

          <h3 className="mt-2 text-xl font-black tracking-tight">{journey.title}</h3>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">{journey.description}</p>

          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-foreground">
            {journey.actionLabel}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CommerceMixSection({ mix }: { mix: CommerceMix }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow={mix.eyebrow}
        title={mix.title}
        description={mix.description}
        helper={mix.reason}
        href={mix.href}
        actionLabel="See all"
      />

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pr-8 scrollbar-hide sm:gap-4">
        {mix.products.map(product => (
          <CommerceProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function CommerceProductCard({ product }: { product: CommerceProduct }) {
  return (
    <Link href={`/products/${product.slug}`} className="group w-40 shrink-0 snap-start sm:w-48 lg:w-52">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted shadow-lg">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="208px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isNew ? (
            <span className="rounded-full bg-white/90 px-2 py-1 text-[8px] font-black text-black">NEW</span>
          ) : null}

          {product.featured ? (
            <span className="rounded-full bg-amber-200/90 px-2 py-1 text-[8px] font-black text-amber-950">
              FEATURED
            </span>
          ) : null}
        </div>

        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-black text-black shadow-sm">
          {currencyFormatter.format(product.price)}
        </span>

        <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition group-hover:scale-105">
          <ArrowRight className="size-4" />
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-black">{product.name}</p>

      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="truncate text-[10px] capitalize text-muted-foreground">
          {product.categorySlug.replaceAll('-', ' ')}
        </p>

        <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold">
          <Star className="size-3 fill-current text-amber-500" />
          {product.rating.toFixed(1)}
        </span>
      </div>
    </Link>
  );
}

function RecentOrdersSection({ orders }: { orders: CommerceOrder[] }) {
  const visibleOrders = orders.slice(0, 4);

  return (
    <section className="rounded-3xl border border-border/60 bg-card/55 p-4 shadow-lg sm:p-6">
      <SectionHeader
        eyebrow="Purchases and receipts"
        title="Your recent commerce"
        description="Orders remain connected to their payment, delivery and product records."
        href="/orders"
        actionLabel="View all orders"
      />

      {visibleOrders.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {visibleOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PackageCheck className="size-6" />}
          title="Your purchase history starts here"
          description="Completed and active orders will appear as living commerce records."
          href="/store"
          actionLabel="Explore the store"
        />
      )}
    </section>
  );
}

function OrderCard({ order }: { order: CommerceOrder }) {
  const firstItem = order.items[0];

  return (
    <Link
      href={`/orders?order=${order.id}`}
      className="group flex min-w-0 items-center gap-4 rounded-3xl border border-border/60 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
        {firstItem?.image ? (
          <Image
            src={firstItem.image}
            alt={firstItem.productName}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <PackageCheck className="size-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] font-black uppercase tracking-wider text-primary">{order.orderNumber}</p>

          <span className="rounded-full bg-muted px-2 py-1 text-[8px] font-black uppercase">
            {formatStatus(order.status)}
          </span>
        </div>

        <p className="mt-2 truncate text-sm font-black">{firstItem?.productName ?? 'AJ Logik order'}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock3 className="size-3" />
            {formatDate(order.createdAt)}
          </span>

          <span>
            {order.items.length} product
            {order.items.length === 1 ? '' : 's'}
          </span>

          <span className="font-bold text-foreground">{currencyFormatter.format(order.total)}</span>
        </div>
      </div>

      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
    </Link>
  );
}

function CommerceClosingPanel() {
  const { openAssistant } = useCommerceExperience();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-amber-300/15 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-200">
            RCENTZ commerce experience
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Your shopping life should remember where you stopped.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
            Keep discovering, return to meaningful moments, or let AJ Companion guide the next move.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openAssistant()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black text-slate-950 transition hover:-translate-y-0.5">
            <Bot className="size-4" />
            Open AJ Companion
          </button>

          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10">
            Enter the store
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CommerceAssistantDock() {
  const {
    experience,
    assistantOpen,
    activeAssistantAction,
    openAssistant,
    closeAssistant,
    selectAssistantAction
  } = useCommerceExperience();

  const { assistant } = experience;

  return (
    <>
      {assistantOpen ? (
        <aside className="fixed bottom-20 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-3xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl lg:bottom-6 lg:right-6">
          <div className="relative overflow-hidden bg-slate-950 p-5 text-white">
            <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-rose-500/25 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-amber-200">
                  <Bot className="size-5" />
                </span>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                    Full-time companion
                  </p>

                  <h2 className="mt-1 text-lg font-black">AJ Companion</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAssistant}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
                aria-label="Close AJ Companion">
                <X className="size-4" />
              </button>
            </div>

            <p className="relative mt-4 text-xs leading-5 text-white/60">
              {assistant.greeting} {assistant.summary}
            </p>
          </div>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
            {activeAssistantAction ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-primary">Current request</p>

                <p className="mt-2 text-sm font-black">{activeAssistantAction.title}</p>

                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  {activeAssistantAction.prompt}
                </p>

                <Link
                  href={activeAssistantAction.href}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[10px] font-black text-background">
                  {activeAssistantAction.actionLabel}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : null}

            <p className="px-1 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              Suggested next moves
            </p>

            {assistant.actions.map(action => (
              <button
                key={action.id}
                type="button"
                onClick={() => selectAssistantAction(action)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 text-left transition hover:border-primary/30 hover:bg-muted/60">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black">{action.title}</span>

                  <span className="mt-1 block line-clamp-2 text-[9px] leading-4 text-muted-foreground">
                    {action.description}
                  </span>
                </span>

                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
              </button>
            ))}

            <p className="px-2 pt-1 text-center text-[9px] leading-4 text-muted-foreground">
              The companion already receives the active workspace, priority journey, cart, orders, reviews and
              discovery context.
            </p>
          </div>
        </aside>
      ) : null}

      <button
        type="button"
        onClick={() => openAssistant()}
        className="fixed bottom-20 right-3 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-2xl transition hover:-translate-y-0.5 lg:bottom-6 lg:right-6"
        aria-label="Open AJ Companion">
        <span className="relative">
          <MessageCircle className="size-5" />
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
        </span>

        <span className="hidden sm:inline">Ask AJ</span>
      </button>
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  helper,
  href,
  actionLabel
}: {
  eyebrow: string;
  title: string;
  description: string;
  helper?: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{eyebrow}</p>

        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>

        <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{description}</p>

        {helper ? (
          <p className="mt-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            {helper}
          </p>
        ) : null}
      </div>

      {href && actionLabel ? (
        <Link href={href} className="inline-flex shrink-0 items-center gap-2 text-xs font-black text-primary">
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-border/60 bg-background/65 px-3 py-2 backdrop-blur">
      <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>

      <span className="ml-2 text-[9px] font-black uppercase">{value}</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  href,
  actionLabel
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="mt-5 grid min-h-56 place-items-center rounded-3xl border border-dashed border-border/70 bg-muted/25 p-6 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-background text-primary shadow-sm">
          {icon}
        </span>

        <h3 className="mt-4 text-lg font-black">{title}</h3>

        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground">{description}</p>

        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-black text-background">
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
