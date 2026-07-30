'use client';

import Image from 'next/image';

import {
  ArrowRight,
  LoaderCircle,
  PackageOpen,
  ReceiptText,
  RefreshCcw
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  useCustomerCommerceRuntime
} from '../runtime/useCustomerCommerceRuntime';

function formatCurrency(
  value: number
): string {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0
    }
  ).format(
    value
  );
}

function formatDate(
  value: string
): string {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return date.toLocaleDateString(
    'en-NG',
    {
      month:
        'short',

      day:
        'numeric',

      year:
        'numeric'
    }
  );
}

export default function RecentOrdersWidget() {
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

  const orders =
    data?.orders.slice(
      0,
      3
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
            Customer commerce
          </p>

          <h3 className="mt-1 text-base font-bold tracking-tight text-primary">
            Recent Orders
          </h3>

          <p className="mt-1 text-xs leading-5 text-primary/50">
            Your latest real order and payment records.
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ReceiptText className="size-5" />
        </span>
      </header>

      {loading ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-primary/10 bg-background/30 p-4">
          <LoaderCircle className="size-4 animate-spin text-primary" />

          <p className="text-xs text-primary/55">
            Loading order activity
          </p>
        </div>
      ) : signedOut ? (
        <div className="mt-5 rounded-2xl border border-dashed border-primary/15 bg-background/30 p-5 text-center">
          <PackageOpen className="mx-auto size-7 text-primary/35" />

          <p className="mt-3 text-sm font-semibold text-primary">
            Sign in to view orders
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
      ) : orders.length ===
        0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-primary/15 bg-background/30 p-5 text-center">
          <PackageOpen className="mx-auto size-7 text-primary/35" />

          <p className="mt-3 text-sm font-semibold text-primary">
            No orders yet
          </p>

          <p className="mt-1 text-xs leading-5 text-primary/50">
            Completed checkouts will appear here without mock order data.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/store'
              )
            }
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/50 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-background">
            Explore Store

            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-2">
            {orders.map(
              order => (
                <button
                  key={
                    order.id
                  }
                  type="button"
                  onClick={() =>
                    router.push(
                      '/account/journey/orders'
                    )
                  }
                  className="
                    group flex w-full
                    items-center gap-3
                    rounded-2xl border
                    border-primary/10
                    bg-background/35
                    p-3 text-left
                    transition
                    hover:border-primary/20
                    hover:bg-background/55
                  ">
                  <div className="flex -space-x-3">
                    {order.items
                      .slice(
                        0,
                        2
                      )
                      .map(
                        item => (
                          <span
                            key={
                              item.id
                            }
                            className="
                              relative size-11
                              overflow-hidden
                              rounded-xl border-2
                              border-background
                              bg-muted
                            ">
                            {item.image ? (
                              <Image
                                src={
                                  item.image
                                }
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="grid size-full place-items-center">
                                <PackageOpen className="size-4 text-muted-foreground" />
                              </span>
                            )}
                          </span>
                        )
                      )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-xs font-semibold text-primary">
                        {
                          order.orderNumber
                        }
                      </p>

                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary">
                        {
                          order.status.replaceAll(
                            '_',
                            ' '
                          )
                        }
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-primary/45">
                      {
                        order.items.length
                      }{' '}
                      {order.items.length ===
                      1
                        ? 'item'
                        : 'items'}{' '}
                      ·{' '}
                      {
                        formatDate(
                          order.createdAt
                        )
                      }
                    </p>

                    <p className="mt-1 text-[11px] font-bold text-primary/75">
                      {
                        formatCurrency(
                          order.total
                        )
                      }
                    </p>
                  </div>

                  <ArrowRight className="size-4 shrink-0 text-primary/35 transition group-hover:translate-x-1" />
                </button>
              )
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-background/40 p-3">
              <p className="text-[9px] uppercase tracking-wide text-primary/40">
                Paid
              </p>

              <p className="mt-1 text-lg font-bold text-primary">
                {
                  data?.pulse
                    .paidOrderCount ??
                  0
                }
              </p>
            </div>

            <div className="rounded-2xl bg-background/40 p-3">
              <p className="text-[9px] uppercase tracking-wide text-primary/40">
                Active
              </p>

              <p className="mt-1 text-lg font-bold text-primary">
                {
                  data?.pulse
                    .activeOrderCount ??
                  0
                }
              </p>
            </div>

            <div className="rounded-2xl bg-background/40 p-3">
              <p className="text-[9px] uppercase tracking-wide text-primary/40">
                Delivered
              </p>

              <p className="mt-1 text-lg font-bold text-primary">
                {
                  data?.pulse
                    .deliveredOrderCount ??
                  0
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                '/account/journey/orders'
              )
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-background transition hover:opacity-90">
            Open Order Journey

            <ArrowRight className="size-3.5" />
          </button>
        </>
      )}
    </section>
  );
}
