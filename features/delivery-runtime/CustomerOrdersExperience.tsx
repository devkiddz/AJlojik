'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Link from 'next/link';

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck
} from 'lucide-react';

import {
  useWorkspace
} from '@/features/workspace';

import {
  useIdentity
} from '@/providers/IdentityProvider';

import type {
  CustomerOrderValue,
  DeliveryStatusValue
} from './deliveryContracts';

const currency =
  new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }
  );

const deliverySteps:
  DeliveryStatusValue[] = [
    'PENDING',
    'ASSIGNED',
    'BARCODE_SCANNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED',
    'DELIVERED'
  ];

function label(
  value: string
): string {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(
      /^\w/,
      character =>
        character.toUpperCase()
    );
}

async function readJson<T>(
  response: Response
): Promise<T> {
  const payload =
    (await response.json()) as T & {
      error?: string;
    };

  if (!response.ok) {
    throw new Error(
      payload.error ??
        'Orders could not be loaded.'
    );
  }

  return payload;
}

export function CustomerOrdersExperience() {
  const {
    activeWorkspace,
    loading:
      workspaceLoading
  } =
    useWorkspace();

  const {
    isAuthenticated,
    isPending
  } =
    useIdentity();

  const activeWorkspaceId =
    activeWorkspace?.id ??
    null;

  const [
    orders,
    setOrders
  ] =
    useState<
      CustomerOrderValue[]
    >([]);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );

  const load =
    useCallback(
      async (
        quiet = false
      ) => {
        if (
          !activeWorkspaceId ||
          !isAuthenticated
        ) {
          setOrders([]);
          setLoading(false);

          return;
        }

        if (!quiet) {
          setLoading(true);
        }

        setError(null);

        try {
          const response =
            await fetch(
              `/api/orders?workspaceId=${encodeURIComponent(
                activeWorkspaceId
              )}`,
              {
                cache:
                  'no-store'
              }
            );

          const data =
            await readJson<{
              orders:
                CustomerOrderValue[];
            }>(
              response
            );

          setOrders(
            data.orders
          );
        } catch (cause) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Orders could not be loaded.'
          );
        } finally {
          if (!quiet) {
            setLoading(false);
          }
        }
      },
      [
        activeWorkspaceId,
        isAuthenticated
      ]
    );

  useEffect(
    () => {
      const start =
        window.setTimeout(
          () =>
            void load(),
          0
        );

      const interval =
        window.setInterval(
          () =>
            void load(
              true
            ),
          20_000
        );

      return () => {
        window.clearTimeout(
          start
        );

        window.clearInterval(
          interval
        );
      };
    },
    [
      load
    ]
  );

  const activeCount =
    useMemo(
      () =>
        orders.filter(
          order =>
            order.delivery &&
            ![
              'DELIVERED',
              'FAILED',
              'CANCELLED'
            ].includes(
              order.delivery
                .status
            )
        ).length,
      [
        orders
      ]
    );

  if (
    isPending ||
    workspaceLoading
  ) {
    return (
      <main className="grid min-h-[70vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4">
        <section className="max-w-lg rounded-[2rem] border bg-card p-8 text-center shadow-xl">
          <ShieldCheck className="mx-auto size-10 text-primary" />

          <h1 className="mt-5 text-3xl font-black">
            Sign in to view
            orders
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Receipts, fulfilment
            status and live
            delivery progress are
            attached to your
            account.
          </p>

          <Link
            href="/sign-in?next=/orders"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-black text-background">
            Continue to sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[2rem] border bg-card/85 p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary/70">
                Customer
                fulfilment
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
                Orders
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Payment,
                preparation, Order
                and Delivery truth
                appear in one
                customer timeline.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-black disabled:opacity-50">
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}

              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric
              icon={<ShoppingBag />}
              label="Orders"
              value={
                orders.length
              }
            />

            <Metric
              icon={<Truck />}
              label="Active delivery"
              value={
                activeCount
              }
            />

            <Metric
              icon={<CheckCircle2 />}
              label="Delivered"
              value={
                orders.filter(
                  order =>
                    order.delivery
                      ?.status ===
                    'DELIVERED'
                ).length
              }
            />
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading &&
        !orders.length ? (
          <div className="h-96 animate-pulse rounded-[2rem] border bg-muted/30" />
        ) : orders.length ? (
          <section className="space-y-4">
            {orders.map(
              order => (
                <OrderCard
                  key={
                    order.id
                  }
                  order={
                    order
                  }
                />
              )
            )}
          </section>
        ) : (
          <section className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed bg-card/50 p-8 text-center">
            <div>
              <PackageCheck className="mx-auto size-8 text-muted-foreground" />

              <h2 className="mt-4 font-black">
                No orders yet
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Completed checkout
                will create your
                first Order and
                Delivery timeline.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function OrderCard({
  order
}: {
  order:
    CustomerOrderValue;
}) {
  const delivery =
    order.delivery;

  const currentIndex =
    delivery
      ? deliverySteps.indexOf(
          delivery.status
        )
      : -1;

  return (
    <article className="overflow-hidden rounded-[2rem] border bg-card shadow-lg">
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-muted-foreground">
              {new Date(
                order.createdAt
              ).toLocaleString(
                'en-NG'
              )}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {
                order.orderNumber
              }
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {
                order.items.length
              }{' '}
              product
              {order.items.length ===
              1
                ? ''
                : 's'}{' '}
              ·{' '}
              {currency.format(
                order.total
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-muted px-3 py-2 text-[10px] font-black">
              Order{' '}
              {label(
                order.status
              )}
            </span>

            <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-[10px] font-black text-emerald-600">
              Payment{' '}
              {label(
                order.paymentStatus
              )}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {order.items
            .slice(
              0,
              4
            )
            .map(
              item => (
                <div
                  key={
                    item.id
                  }
                  className="flex items-center justify-between gap-3 rounded-2xl bg-muted/35 p-3 text-xs">
                  <span className="min-w-0 truncate">
                    {
                      item.quantity
                    }{' '}
                    ×{' '}
                    {
                      item.productName
                    }
                  </span>

                  <strong className="shrink-0">
                    {currency.format(
                      item.totalPrice
                    )}
                  </strong>
                </div>
              )
            )}
        </div>
      </div>

      {delivery ? (
        <section className="border-t bg-muted/15 p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-primary/70">
                {
                  delivery.trackingCode
                }
              </p>

              <h3 className="mt-1 text-lg font-black">
                Delivery{' '}
                {label(
                  delivery.status
                )}
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                {delivery.dispatcherName ??
                  label(
                    delivery.method
                  )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-black text-background">
                Track delivery

                <ArrowRight className="size-4" />
              </Link>

              {delivery.lastLatitude !==
                null &&
              delivery.lastLongitude !==
                null ? (
                <a
                  href={`https://www.google.com/maps?q=${delivery.lastLatitude},${delivery.lastLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-black">
                  <MapPin className="size-4" />

                  External map
                </a>
              ) : null}
            </div>
          </div>

          {![
            'FAILED',
            'CANCELLED'
          ].includes(
            delivery.status
          ) ? (
            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {deliverySteps.map(
                (
                  step,
                  index
                ) => {
                  const complete =
                    index <=
                    currentIndex;

                  return (
                    <div
                      key={
                        step
                      }
                      className="min-w-0 text-center">
                      <span
                        className={
                          complete
                            ? 'mx-auto grid size-8 place-items-center rounded-full bg-primary text-primary-foreground'
                            : 'mx-auto grid size-8 place-items-center rounded-full bg-muted text-muted-foreground'
                        }>
                        {complete ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Clock3 className="size-4" />
                        )}
                      </span>

                      <p className="mt-2 truncate text-[8px] font-black uppercase">
                        {label(
                          step
                        )}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-300">
              This delivery needs
              operational
              attention. The Store
              has been notified.
            </p>
          )}

          {delivery.lastLocationAt ? (
            <p className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
              <MapPin className="size-3.5" />

              GPS updated{' '}
              {new Date(
                delivery.lastLocationAt
              ).toLocaleString(
                'en-NG'
              )}
            </p>
          ) : null}
        </section>
      ) : null}
    </article>
  );
}

function Metric({
  icon,
  label: metricLabel,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-muted/35 p-4">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground [&_svg]:size-4">
        {icon}
        {metricLabel}
      </p>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}
