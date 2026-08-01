'use client';

import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck
} from 'lucide-react';

import {
  useGlobalOverlay
} from '@/features/global-overlay';

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

import {
  LiveDeliveryMap
} from './LiveDeliveryMap';

const currency =
  new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',
      currency:
        'NGN',
      maximumFractionDigits:
        0
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
) {
  return value
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /^\w/,
      character =>
        character.toUpperCase()
    );
}

async function readJson<T>(
  response:
    Response
): Promise<T> {
  const payload =
    (await response.json()) as T & {
      error?:
        string;
    };

  if (!response.ok) {
    throw new Error(
      payload.error ??
      'The Order request could not be completed.'
    );
  }

  return payload;
}

export function CustomerOrderDetailExperience({
  orderId
}: {
  orderId:
    string;
}) {
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

  const {
    openOverlay
  } =
    useGlobalOverlay();

  const [
    order,
    setOrder
  ] =
    useState<CustomerOrderValue | null>(
      null
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

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
        quiet =
          false
      ) => {
        if (
          !activeWorkspaceId ||
          !isAuthenticated
        ) {
          setLoading(
            false
          );

          return;
        }

        if (!quiet) {
          setLoading(
            true
          );
        }

        setError(
          null
        );

        try {
          const response =
            await fetch(
              `/api/orders/${encodeURIComponent(
                orderId
              )}?workspaceId=${encodeURIComponent(
                activeWorkspaceId
              )}`,
              {
                cache:
                  'no-store'
              }
            );

          const data =
            await readJson<{
              order:
                CustomerOrderValue;
            }>(
              response
            );

          setOrder(
            data.order
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'The Order could not be loaded.'
          );
        } finally {
          if (!quiet) {
            setLoading(
              false
            );
          }
        }
      },
      [
        activeWorkspaceId,
        isAuthenticated,
        orderId
      ]
    );

  const deliveryStatus =
    order?.delivery?.status ??
    null;

  useEffect(
    () => {
      const start =
        window.setTimeout(
          () =>
            void load(),
          0
        );

      const active =
        deliveryStatus !==
          null &&
        ![
          'DELIVERED',
          'FAILED',
          'CANCELLED'
        ].includes(
          deliveryStatus
        );

      const interval =
        active
          ? window.setInterval(
              () =>
                void load(
                  true
                ),
              10_000
            )
          : null;

      return () => {
        window.clearTimeout(
          start
        );

        if (
          interval !==
          null
        ) {
          window.clearInterval(
            interval
          );
        }
      };
    },
    [
      deliveryStatus,
      load
    ]
  );

  const currentIndex =
    deliveryStatus
      ? deliverySteps.indexOf(
          deliveryStatus
        )
      : -1;

  function openConfirmation() {
    if (
      !order ||
      !activeWorkspaceId
    ) {
      return;
    }

    openOverlay({
      id:
        `customer-delivery-confirmation-${order.id}`,
      eyebrow:
        'Delivery completion',
      title:
        'Confirm successful receipt',
      description:
        'Confirm only after the complete package has reached you. This closes the Delivery, Order and any connected prepared Shopping List journey.',
      variant:
        'dialog',
      size:
        'md',
      content: (
        <CustomerDeliveryConfirmationForm
          order={
            order
          }
          workspaceId={
            activeWorkspaceId
          }
          onConfirmed={
            setOrder
          }
        />
      )
    });
  }

  if (
    isPending ||
    workspaceLoading ||
    loading
  ) {
    return (
      <main className="grid min-h-[75vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  if (
    !isAuthenticated
  ) {
    return (
      <main className="grid min-h-[75vh] place-items-center px-4 text-center">
        <section className="max-w-lg rounded-[2rem] border bg-card p-8 shadow-xl">
          <ShieldCheck className="mx-auto size-10 text-primary" />

          <h1 className="mt-5 text-3xl font-black">
            Customer access
            required
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with the
            account that placed
            this Order.
          </p>
        </section>
      </main>
    );
  }

  if (
    error ||
    !order
  ) {
    return (
      <main className="grid min-h-[75vh] place-items-center px-4 text-center">
        <section className="max-w-lg rounded-[2rem] border bg-card p-8 shadow-xl">
          <PackageCheck className="mx-auto size-10 text-muted-foreground" />

          <h1 className="mt-5 text-2xl font-black">
            Order unavailable
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            {error ??
              'This Order could not be found.'}
          </p>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-black">
            <RefreshCw className="size-4" />

            Retry
          </button>
        </section>
      </main>
    );
  }

  const delivery =
    order.delivery;

  return (
    <main className="min-h-[80vh] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border bg-card/85 p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/75">
                Live Order
                journey
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                {
                  order.orderNumber
                }
              </h1>

              <p className="mt-3 text-sm text-muted-foreground">
                {
                  order.items.length
                }{' '}
                product
                {order.items.length ===
                1
                  ? ''
                  : 's'}
                {' · '}
                {currency.format(
                  order.total
                )}
                {' · '}
                Payment{' '}
                {label(
                  order.paymentStatus
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-2 text-[10px] font-black">
                Order{' '}
                {label(
                  order.status
                )}
              </span>

              {delivery ? (
                <span className="rounded-full bg-primary/10 px-3 py-2 text-[10px] font-black text-primary">
                  Delivery{' '}
                  {label(
                    delivery.status
                  )}
                </span>
              ) : null}

              <button
                type="button"
                onClick={() =>
                  void load()
                }
                className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-black">
                <RefreshCw className="size-3.5" />

                Refresh
              </button>
            </div>
          </div>
        </header>

        {delivery ? (
          <>
            <LiveDeliveryMap
              latitude={
                delivery.lastLatitude
              }
              longitude={
                delivery.lastLongitude
              }
              lastLocationAt={
                delivery.lastLocationAt
              }
              events={
                delivery.events
              }
            />

            <section className="rounded-[2rem] border bg-card p-5 shadow-lg sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary/75">
                    {
                      delivery.trackingCode
                    }
                  </p>

                  <h2 className="mt-2 text-xl font-black">
                    Delivery progress
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {delivery.dispatcherName ??
                      label(
                        delivery.method
                      )}
                    {delivery.estimatedArrival
                      ? ` · ETA ${new Date(
                          delivery.estimatedArrival
                        ).toLocaleString(
                          'en-NG'
                        )}`
                      : ''}
                  </p>
                </div>

                {delivery.status ===
                'ARRIVED' ? (
                  <button
                    type="button"
                    onClick={
                      openConfirmation
                    }
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white">
                    <CheckCircle2 className="size-4" />

                    Confirm receipt
                  </button>
                ) : null}
              </div>

              {![
                'FAILED',
                'CANCELLED'
              ].includes(
                delivery.status
              ) ? (
                <div className="mt-7 grid grid-cols-4 gap-2 sm:grid-cols-7">
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
                                ? 'mx-auto grid size-9 place-items-center rounded-full bg-primary text-primary-foreground'
                                : 'mx-auto grid size-9 place-items-center rounded-full bg-muted text-muted-foreground'
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
                <p className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-700 dark:text-amber-300">
                  This Delivery
                  needs operational
                  attention. The
                  Store has been
                  notified.
                </p>
              )}
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
              <article className="rounded-[2rem] border bg-card p-5 shadow-lg sm:p-7">
                <h2 className="font-black">
                  Package contents
                </h2>

                <div className="mt-4 space-y-3">
                  {order.items.map(
                    item => (
                      <div
                        key={
                          item.id
                        }
                        className="flex items-center justify-between gap-4 rounded-2xl bg-muted/30 p-4 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-bold">
                            {
                              item.productName
                            }
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              item.variantLabel
                            }
                            {' · '}
                            Qty{' '}
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <strong className="shrink-0 text-xs">
                          {currency.format(
                            item.totalPrice
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>
              </article>

              <article className="rounded-[2rem] border bg-card p-5 shadow-lg sm:p-7">
                <h2 className="font-black">
                  Delivery timeline
                </h2>

                <div className="mt-4 space-y-3">
                  {delivery.events.length ? (
                    delivery.events.map(
                      event => (
                        <div
                          key={
                            event.id
                          }
                          className="flex gap-3 rounded-2xl border border-border/60 p-3">
                          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            {event.source ===
                            'CUSTOMER' ? (
                              <CheckCircle2 className="size-4" />
                            ) : event.latitude !==
                                null ? (
                              <MapPin className="size-4" />
                            ) : (
                              <Truck className="size-4" />
                            )}
                          </span>

                          <div className="min-w-0">
                            <p className="text-xs font-black">
                              {label(
                                event.status
                              )}
                              {' · '}
                              {label(
                                event.source
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {new Date(
                                event.createdAt
                              ).toLocaleString(
                                'en-NG'
                              )}
                            </p>

                            {event.note ? (
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                {
                                  event.note
                                }
                              </p>
                            ) : null}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
                      Delivery
                      events will
                      appear here.
                    </p>
                  )}
                </div>
              </article>
            </section>
          </>
        ) : (
          <section className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed bg-card/50 p-8 text-center">
            <div>
              <PackageCheck className="mx-auto size-8 text-muted-foreground" />

              <h2 className="mt-4 font-black">
                Delivery not
                created yet
              </h2>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function CustomerDeliveryConfirmationForm({
  order,
  workspaceId,
  onConfirmed
}: {
  order:
    CustomerOrderValue;
  workspaceId:
    string;
  onConfirmed: (
    order:
      CustomerOrderValue
  ) => void;
}) {
  const {
    closeOverlay
  } =
    useGlobalOverlay();

  const [
    note,
    setNote
  ] =
    useState('');

  const [
    submitting,
    setSubmitting
  ] =
    useState(
      false
    );

  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );

  async function confirm() {
    setSubmitting(
      true
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          `/api/orders/${encodeURIComponent(
            order.id
          )}/delivery-confirmation`,
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                workspaceId,
                note
              })
          }
        );

      const data =
        await readJson<{
          order:
            CustomerOrderValue;
        }>(
          response
        );

      onConfirmed(
        data.order
      );

      closeOverlay();
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Receipt could not be confirmed.'
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border bg-muted/25 p-5">
        <p className="text-xs font-black">
          {
            order.orderNumber
          }
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Confirm that the
          complete package has
          reached you in an
          acceptable condition.
          This action closes the
          active rider session and
          marks the connected
          Order as delivered.
        </p>
      </section>

      <label className="block text-xs font-bold">
        Receipt note
        (optional)

        <textarea
          value={
            note
          }
          onChange={
            event =>
              setNote(
                event.target
                  .value
              )
          }
          rows={
            4
          }
          maxLength={
            1000
          }
          placeholder="Package received successfully."
          className="mt-2 w-full resize-y rounded-2xl border bg-background p-3 text-sm outline-none focus:border-primary"
        />
      </label>

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={
            submitting
          }
          onClick={() =>
            closeOverlay()
          }
          className="h-11 rounded-full border px-5 text-xs font-black disabled:opacity-50">
          Not yet
        </button>

        <button
          type="button"
          disabled={
            submitting
          }
          onClick={() =>
            void confirm()
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white disabled:opacity-50">
          {submitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}

          Confirm package
          received
        </button>
      </div>
    </div>
  );
}
