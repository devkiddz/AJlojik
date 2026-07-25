'use client';

import Link from 'next/link';

import {
  ArrowRight
} from 'lucide-react';

import {
  DashboardAssistant,
  DashboardAttentionCard,
  DashboardCanvasSection,
  DashboardCommerceBoard,
  DashboardHero,
  DashboardPersonalCommerceBoard,
  DashboardSnapRail
} from '../components';

import {
  useCustomerDashboard
} from '../providers/CustomerDashboardProvider';

const mobileCardClassName = [
  'w-[84vw]',
  'max-w-[26rem]',
  'shrink-0',
  'snap-start',

  'lg:w-full',
  'lg:max-w-none',
  'lg:min-w-0'
].join(' ');

export default function CustomerDashboard() {
  const { dashboard } =
    useCustomerDashboard();

  const {
    data,
    priority,
    actions,
    summary,
    quickActions,
    activity,
    journeys,
    mixes,
    orchestration
  } = dashboard;

  const {
    budgets,
    visibility,
    sections
  } = orchestration;

  const commerceCardCount = [
    visibility.overview,
    visibility.quickActions,
    visibility.activity,
    visibility.orders,
    visibility.companion
  ].filter(Boolean).length;

  const personalCardCount =
    mixes.length +
    journeys.length;

  return (
    <main className="relative h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-muted/20">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-40 size-96 rounded-full bg-rose-700/8 blur-3xl" />
        <div className="absolute -left-40 top-1/3 size-96 rounded-full bg-sky-700/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-80 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[92rem] space-y-7 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <section
          aria-label={
            sections.attention.title
          }
          className="space-y-3">
          <DashboardHero
            priority={priority}
            section={
              sections.attention
            }
          />

          {actions.length > 0 ? (
            <DashboardSnapRail
              itemCount={
                actions.length
              }
              ariaLabel="Supporting actions"
              className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-3">
              {actions.map(
                item => (
                  <div
                    key={item.id}
                    data-dashboard-snap-card="true"
                    className={
                      mobileCardClassName
                    }>
                    <DashboardAttentionCard
                      item={item}
                    />
                  </div>
                )
              )}
            </DashboardSnapRail>
          ) : null}
        </section>

        {visibility.commerce ? (
          <DashboardCanvasSection
            eyebrow={
              sections.commerce.eyebrow
            }
            title={
              sections.commerce.title
            }
            description={
              sections.commerce
                .description
            }
            showSlideHint={
              commerceCardCount > 1
            }>
            <DashboardCommerceBoard
              summary={summary}
              quickActions={
                quickActions
              }
              activity={activity}
              orders={data.orders}
              visibility={visibility}
              orderBudget={
                budgets.orders
              }
            />
          </DashboardCanvasSection>
        ) : null}

        {visibility.personalCommerce ? (
          <DashboardCanvasSection
            eyebrow={
              sections.personalCommerce
                .eyebrow
            }
            title={
              sections.personalCommerce
                .title
            }
            description={
              sections.personalCommerce
                .description
            }
            href="/store"
            actionLabel="Open store"
            showSlideHint={
              personalCardCount > 1
            }>
            <DashboardPersonalCommerceBoard
              mixes={mixes}
              journeys={journeys}
            />
          </DashboardCanvasSection>
        ) : null}

        <DashboardFooter />

        <div className="h-24 lg:h-12" />
      </div>

      <DashboardAssistant />
    </main>
  );
}

function DashboardFooter() {
  return (
    <footer className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">
          AJ Logik customer dashboard
        </p>

        <p className="mt-0.5 text-muted-foreground">
          Simple, personal and connected across every workspace visit.
        </p>
      </div>

      <Link
        href="/settings"
        className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-border/60 bg-background/75 px-4 text-xs font-semibold transition hover:border-primary/30 hover:bg-muted sm:self-auto">
        Dashboard settings
        <ArrowRight className="size-4" />
      </Link>
    </footer>
  );
}
