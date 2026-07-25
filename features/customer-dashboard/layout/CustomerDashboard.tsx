'use client';

import Link from 'next/link';

import {
  ArrowRight,
  PackageCheck
} from 'lucide-react';

import {
  DashboardAssistant,
  DashboardHeader,
  DashboardJourneyCard,
  DashboardOrderCard,
  DashboardOverview,
  DashboardPriority,
  DashboardProductCard,
  DashboardSectionHeader
} from '../components';

import type {
  CommerceJourneyItem,
  CommerceMix,
  CommerceOrder
} from '../contracts/customerDashboardTypes';

import {
  useCustomerDashboard
} from '../providers/CustomerDashboardProvider';

export default function CustomerDashboard() {
  const { dashboard } =
    useCustomerDashboard();

  const {
    data,
    priority,
    pulse,
    journeys,
    mixes
  } = dashboard;

  return (
    <main className="relative h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-muted/20">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-40 size-96 rounded-full bg-rose-700/8 blur-3xl" />
        <div className="absolute -left-40 top-1/3 size-96 rounded-full bg-sky-700/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-80 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[92rem] space-y-4 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <DashboardHeader />

        <section className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.75fr)]">
          <DashboardPriority
            priority={priority}
          />

          <DashboardOverview
            items={pulse}
            totalSpent={
              data.pulse.totalSpent
            }
          />
        </section>

        {journeys.length > 0 ? (
          <DashboardJourneySection
            journeys={journeys}
          />
        ) : null}

        {mixes.map(mix => (
          <DashboardMixSection
            key={mix.id}
            mix={mix}
          />
        ))}

        <DashboardOrdersSection
          orders={data.orders}
        />

        <DashboardFooter />

        <div className="h-24 lg:h-12" />
      </div>

      <DashboardAssistant />
    </main>
  );
}

function DashboardJourneySection({
  journeys
}: {
  journeys: CommerceJourneyItem[];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:p-5">
      <DashboardSectionHeader
        eyebrow="Continue"
        title="Pick up where you stopped"
        description="Return to active orders, saved decisions and recent shopping moments."
        href="/store"
        actionLabel="Open store"
      />

      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-6 scrollbar-hide">
        {journeys.map(journey => (
          <DashboardJourneyCard
            key={journey.id}
            journey={journey}
          />
        ))}
      </div>
    </section>
  );
}

function DashboardMixSection({
  mix
}: {
  mix: CommerceMix;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm sm:p-5">
      <DashboardSectionHeader
        eyebrow={mix.eyebrow}
        title={mix.title}
        description={mix.description}
        helper={mix.reason}
        href={mix.href}
        actionLabel="View all"
      />

      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-6 scrollbar-hide">
        {mix.products.map(
          product => (
            <DashboardProductCard
              key={product.id}
              product={product}
            />
          )
        )}
      </div>
    </section>
  );
}

function DashboardOrdersSection({
  orders
}: {
  orders: CommerceOrder[];
}) {
  const visibleOrders =
    orders.slice(0, 4);

  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm sm:p-5">
      <DashboardSectionHeader
        eyebrow="Orders"
        title="Recent purchases"
        description="Review payment, product and delivery details from your latest orders."
        href="/orders"
        actionLabel="View all orders"
      />

      {visibleOrders.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleOrders.map(
            order => (
              <DashboardOrderCard
                key={order.id}
                order={order}
              />
            )
          )}
        </div>
      ) : (
        <div className="mt-4 grid min-h-48 place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/25 p-6 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-background text-primary shadow-sm">
              <PackageCheck className="size-6" />
            </span>

            <h3 className="mt-4 text-lg font-semibold">
              No orders yet
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-sm leading-5 text-muted-foreground">
              Active and completed purchases will appear here.
            </p>

            <Link
              href="/store"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background">
              Explore the store
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function DashboardFooter() {
  return (
    <footer className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">
          AJ Logik customer dashboard
        </p>

        <p className="mt-0.5 text-muted-foreground">
          Your workspace keeps commerce activity connected across visits.
        </p>
      </div>

      <Link
        href="/settings"
        className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-border/60 bg-background/70 px-4 text-xs font-semibold transition hover:border-primary/30 hover:bg-muted sm:self-auto">
        Dashboard settings
        <ArrowRight className="size-4" />
      </Link>
    </footer>
  );
}
