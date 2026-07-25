'use client';

import Link from 'next/link';

import {
  ArrowRight
} from 'lucide-react';

import {
  DashboardActivityCard,
  DashboardAttentionCard,
  DashboardAssistant,
  DashboardCanvasSection,
  DashboardCommerceOverviewCard,
  DashboardCompanionCard,
  DashboardHeader,
  DashboardJourneyCard,
  DashboardOrdersCard,
  DashboardPriority,
  DashboardProductModule,
  DashboardQuickLinksCard
} from '../components';

import {
  useCustomerDashboard
} from '../providers/CustomerDashboardProvider';

const mobileRailClassName = [
  '-mx-3',
  'flex',
  'snap-x',
  'snap-mandatory',
  'items-start',
  'gap-3',
  'overflow-x-auto',
  'overscroll-x-contain',
  'px-3',
  'pb-2',
  'scroll-px-3',
  'scrollbar-hide',

  'lg:mx-0',
  'lg:overflow-visible',
  'lg:px-0',
  'lg:pb-0'
].join(' ');

const mobileCardClassName = [
  'w-[86vw]',
  'shrink-0',
  'snap-center',

  'lg:w-full',
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
    mixes
  } = dashboard;

  const primaryActions =
    actions.slice(0, 2);

  const firstMix =
    mixes[0];

  const secondMix =
    mixes[1];

  const remainingMixes =
    mixes.slice(2);

  return (
    <main className="relative h-[calc(100dvh-5rem)] min-h-0 overflow-y-auto overscroll-contain bg-muted/20">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-40 size-96 rounded-full bg-rose-700/8 blur-3xl" />
        <div className="absolute -left-40 top-1/3 size-96 rounded-full bg-sky-700/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-80 rounded-full bg-amber-500/8 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[92rem] space-y-7 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <DashboardHeader />

        <DashboardCanvasSection
          eyebrow="Right now"
          title="Needs your attention"
          description="Only the commerce moments that are useful now—nothing noisy or intimidating.">
          <div
            className={`${mobileRailClassName} lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)] lg:items-start lg:gap-3`}>
            <div
              className={
                mobileCardClassName
              }>
              <DashboardPriority
                priority={priority}
              />
            </div>

            <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
              {primaryActions.map(
                item => (
                  <div
                    key={item.id}
                    className={
                      mobileCardClassName
                    }>
                    <DashboardAttentionCard
                      item={item}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </DashboardCanvasSection>

        <DashboardCanvasSection
          eyebrow="Workspace"
          title="Your commerce"
          description="Orders, shortcuts and activity arranged as a calm professional canvas.">
          <div
            className={`${mobileRailClassName} lg:grid lg:grid-cols-3 lg:items-start lg:gap-3`}>
            <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
              <div
                className={
                  mobileCardClassName
                }>
                <DashboardCommerceOverviewCard
                  items={summary}
                />
              </div>

              <div
                className={
                  mobileCardClassName
                }>
                <DashboardActivityCard
                  items={activity}
                />
              </div>
            </div>

            <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
              <div
                className={
                  mobileCardClassName
                }>
                <DashboardQuickLinksCard
                  items={quickActions}
                />
              </div>

              <div
                className={
                  mobileCardClassName
                }>
                <DashboardOrdersCard
                  orders={data.orders}
                />
              </div>
            </div>

            <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
              <div
                className={
                  mobileCardClassName
                }>
                <DashboardCompanionCard />
              </div>
            </div>
          </div>
        </DashboardCanvasSection>

        {mixes.length > 0 ||
        journeys.length > 0 ? (
          <DashboardCanvasSection
            eyebrow="Personal commerce"
            title="Continue your experience"
            description="Product worlds are previewed through stacked product headers, then opened only when you need more."
            href="/store"
            actionLabel="Open store">
            <div
              className={`${mobileRailClassName} lg:grid lg:grid-cols-3 lg:items-start lg:gap-3`}>
              <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
                {firstMix ? (
                  <div
                    className={
                      mobileCardClassName
                    }>
                    <DashboardProductModule
                      mix={firstMix}
                      variant="spotlight"
                    />
                  </div>
                ) : null}

                {journeys[0] ? (
                  <div
                    className={
                      mobileCardClassName
                    }>
                    <DashboardJourneyCard
                      journey={
                        journeys[0]
                      }
                    />
                  </div>
                ) : null}
              </div>

              <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
                {secondMix ? (
                  <div
                    className={
                      mobileCardClassName
                    }>
                    <DashboardProductModule
                      mix={secondMix}
                      variant="list"
                    />
                  </div>
                ) : null}

                {journeys[1] ? (
                  <div
                    className={
                      mobileCardClassName
                    }>
                    <DashboardJourneyCard
                      journey={
                        journeys[1]
                      }
                    />
                  </div>
                ) : null}
              </div>

              <div className="contents lg:grid lg:min-w-0 lg:content-start lg:gap-3">
                {remainingMixes.map(
                  mix => (
                    <div
                      key={mix.id}
                      className={
                        mobileCardClassName
                      }>
                      <DashboardProductModule
                        mix={mix}
                        variant="compact"
                      />
                    </div>
                  )
                )}

                {journeys
                  .slice(2, 3)
                  .map(
                    journey => (
                      <div
                        key={
                          journey.id
                        }
                        className={
                          mobileCardClassName
                        }>
                        <DashboardJourneyCard
                          journey={
                            journey
                          }
                        />
                      </div>
                    )
                  )}
              </div>
            </div>
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
