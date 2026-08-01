'use client';

import {
  ArrowRight,
  CircleCheck,
  Clock3,
  LoaderCircle,
  MapPin,
  PackageOpen,
  RefreshCcw,
  Truck
} from 'lucide-react';

import {
  useMemo
} from 'react';

import {
  useRouter
} from 'next/navigation';

import {
  CompactDeliveryMap
} from '@/features/delivery-runtime/CompactDeliveryMap';

import {
  cn
} from '@/lib/utils';

import {
  useCustomerCommerceRuntime
} from '../runtime/useCustomerCommerceRuntime';

const TERMINAL_STATUSES =
  new Set([
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ]);

const STATUS_PROGRESS: Record<
  string,
  number
> = {
  PENDING:
    10,

  ASSIGNED:
    20,

  BARCODE_SCANNED:
    35,

  PICKED_UP:
    50,

  IN_TRANSIT:
    72,

  ARRIVED:
    90,

  DELIVERED:
    100,

  FAILED:
    100,

  CANCELLED:
    100
};

function formatDateTime(
  value:
    | string
    | null
): string | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toLocaleString(
    'en-NG',
    {
      month:
        'short',

      day:
        'numeric',

      hour:
        'numeric',

      minute:
        '2-digit'
    }
  );
}

function readableStatus(
  value: string
): string {
  return value
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /(^|\s)\S/g,
      character =>
        character.toUpperCase()
    );
}

export default function ActiveDeliveryWidget() {
  const router =
    useRouter();

  const {
    data,
    loading,
    error,
    signedOut,
    refresh
  } =
    useCustomerCommerceRuntime();

  const activeOrder =
    useMemo(
      () =>
        data?.orders.find(
          order =>
            order.delivery &&
            !TERMINAL_STATUSES.has(
              order.delivery.status
            )
        ) ??
        null,
      [
        data?.orders
      ]
    );

  const delivery =
    activeOrder?.delivery ??
    null;

  const progress =
    delivery
      ? STATUS_PROGRESS[
          delivery.status
        ] ??
        15
      : 0;

  const estimatedArrival =
    formatDateTime(
      delivery?.estimatedArrival ??
        null
    );

  const events =
    delivery?.events.slice(
      0,
      4
    ) ??
    [];

  return (
    <section
      className="
        overflow-hidden rounded-3xl
        border border-primary/12
        bg-card/40 p-5
        shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.25)]
      ">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/45">
            Fulfilment status
          </p>

          <h3 className="mt-1 text-base font-bold tracking-tight text-primary">
            Active Delivery
          </h3>

          <p className="mt-1 text-xs leading-5 text-primary/50">
            Honest order movement from the current delivery record.
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Truck className="size-5" />
        </span>
      </header>

      {loading ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-primary/10 bg-background/30 p-4">
          <LoaderCircle className="size-4 animate-spin text-primary" />

          <p className="text-xs text-primary/55">
            Checking delivery activity
          </p>
        </div>
      ) : signedOut ? (
        <div className="mt-5 rounded-2xl border border-dashed border-primary/15 bg-background/30 p-5 text-center">
          <PackageOpen className="mx-auto size-7 text-primary/35" />

          <p className="mt-3 text-sm font-semibold text-primary">
            Sign in to track deliveries
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/sign-in?returnTo=%2Forders'
              )
            }
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-background">
            Sign in

            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-xs leading-5 text-destructive">
            {
              error
            }
          </p>

          <button
            type="button"
            onClick={
              refresh
            }
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-destructive">
            <RefreshCcw className="size-3.5" />

            Try again
          </button>
        </div>
      ) : !activeOrder ||
        !delivery ? (
        <div className="mt-5 rounded-2xl border border-dashed border-primary/15 bg-background/30 p-5 text-center">
          <CircleCheck className="mx-auto size-7 text-emerald-500/70" />

          <p className="mt-3 text-sm font-semibold text-primary">
            No active delivery
          </p>

          <p className="mt-1 text-xs leading-5 text-primary/50">
            This card will activate from a real dispatched order. No mock rider or ETA is displayed.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/account/journey/orders'
              )
            }
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/50 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-background">
            View orders

            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl border border-primary/10 bg-background/35 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-primary">
                  {
                    activeOrder.orderNumber
                  }
                </p>

                <p className="mt-1 text-[11px] text-primary/45">
                  Tracking code:{' '}
                  {
                    delivery.trackingCode
                  }
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                {
                  readableStatus(
                    delivery.status
                  )
                }
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold text-primary/50">
                  Delivery progress
                </span>

                <span className="text-[10px] font-bold text-primary">
                  {
                    progress
                  }%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width:
                      `${progress}%`
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-background/55 p-3">
                <Clock3 className="size-4 text-primary/45" />

                <p className="mt-2 text-[9px] uppercase tracking-wide text-primary/40">
                  Estimated arrival
                </p>

                <p className="mt-1 text-xs font-semibold text-primary">
                  {estimatedArrival ??
                    'Not assigned yet'}
                </p>
              </div>

              <div className="rounded-2xl bg-background/55 p-3">
                <MapPin className="size-4 text-primary/45" />

                <p className="mt-2 text-[9px] uppercase tracking-wide text-primary/40">
                  Live tracking
                </p>

                <p className="mt-1 text-xs font-semibold text-primary">
                  {delivery.trackingEnabled
                    ? 'Tracking enabled'
                    : 'Awaiting rider start'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <CompactDeliveryMap
              orderId={activeOrder.id}
              workspaceId={data?.workspaceId ?? ''}
              initialLatitude={delivery.lastLatitude}
              initialLongitude={delivery.lastLongitude}
              initialLastLocationAt={delivery.lastLocationAt}
              initialStatus={delivery.status}
              initialTrackingEnabled={delivery.trackingEnabled}
              variant="hub"
            />
          </div>

          {events.length >
          0 ? (
            <div className="mt-3 space-y-2">
              {events.map(
                (
                  event,
                  index
                ) => (
                  <div
                    key={`${event.status}:${event.createdAt}:${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-background/30 p-3">
                    <span
                      className={cn(
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                        index ===
                          0
                          ? 'bg-primary text-background'
                          : 'bg-primary/10 text-primary'
                      )}>
                      <CircleCheck className="size-3.5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary">
                        {
                          readableStatus(
                            event.status
                          )
                        }
                      </p>

                      {event.note ? (
                        <p className="mt-0.5 line-clamp-2 text-[10px] text-primary/45">
                          {
                            event.note
                          }
                        </p>
                      ) : null}
                    </div>

                    <span className="shrink-0 text-[9px] text-primary/35">
                      {formatDateTime(
                        event.createdAt
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() =>
              router.push(
                '/account/journey/deliveries'
              )
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-background transition hover:opacity-90">
            Open Delivery Journey

            <ArrowRight className="size-3.5" />
          </button>
        </>
      )}
    </section>
  );
}
