'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Barcode,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
  UserRound
} from 'lucide-react';

import type {
  DeliveryRuntimeValue,
  DeliveryStaffOption,
  DeliveryStatusValue
} from './deliveryContracts';

import {
  RiderHandoverQrFrame
} from './RiderHandoverQrFrame';

type RuntimeResponse = {
  deliveries: DeliveryRuntimeValue[];
  staff: DeliveryStaffOption[];
};

type HandoverResponse = {
  delivery: DeliveryRuntimeValue;
  accessUrl: string;
  expiresAt: string;
};

const currency =
  new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }
  );

const transitions: Partial<
  Record<
    DeliveryStatusValue,
    DeliveryStatusValue[]
  >
> = {
  ASSIGNED: ['CANCELLED'],
  BARCODE_SCANNED: [
    'PICKED_UP',
    'FAILED',
    'CANCELLED'
  ],
  PICKED_UP: [
    'IN_TRANSIT',
    'FAILED'
  ],
  IN_TRANSIT: [
    'ARRIVED',
    'FAILED'
  ],
  ARRIVED: [
    'DELIVERED',
    'FAILED'
  ]
};

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
        'The delivery request could not be completed.'
    );
  }

  return payload;
}

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

export function DeliveryOperationsClient({
  workspaceId,
  workspaceName,
  canManage
}: {
  workspaceId: string;
  workspaceName: string;
  canManage: boolean;
}) {
  const [
    runtime,
    setRuntime
  ] =
    useState<RuntimeResponse>({
      deliveries: [],
      staff: []
    });

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
      async () => {
        setLoading(true);
        setError(null);

        try {
          const response =
            await fetch(
              `/api/admin/deliveries?workspaceId=${encodeURIComponent(
                workspaceId
              )}`,
              {
                cache:
                  'no-store'
              }
            );

          setRuntime(
            await readJson<RuntimeResponse>(
              response
            )
          );
        } catch (cause) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Unable to load delivery operations.'
          );
        } finally {
          setLoading(false);
        }
      },
      [
        workspaceId
      ]
    );

  useEffect(
    () => {
      const task =
        window.setTimeout(
          () =>
            void load(),
          0
        );

      return () =>
        window.clearTimeout(
          task
        );
    },
    [
      load
    ]
  );

  const counts =
    useMemo(
      () => ({
        active:
          runtime.deliveries.filter(
            delivery =>
              ![
                'DELIVERED',
                'FAILED',
                'CANCELLED'
              ].includes(
                delivery.status
              )
          ).length,
        awaiting:
          runtime.deliveries.filter(
            delivery =>
              delivery.status ===
              'PENDING'
          ).length,
        tracking:
          runtime.deliveries.filter(
            delivery =>
              delivery.trackingEnabled
          ).length,
        delivered:
          runtime.deliveries.filter(
            delivery =>
              delivery.status ===
              'DELIVERED'
          ).length
      }),
      [
        runtime.deliveries
      ]
    );

  function replaceDelivery(
    delivery:
      DeliveryRuntimeValue
  ) {
    setRuntime(
      current => ({
        ...current,
        deliveries:
          current.deliveries.map(
            item =>
              item.id ===
              delivery.id
                ? delivery
                : item
          )
      })
    );
  }

  return (
    <main className="admin-page min-h-dvh px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-card/85 p-5 shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary/70">
                {workspaceName} ·
                Live fulfilment
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Delivery operations
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Assign dispatchers,
                issue temporary
                handover access,
                follow live GPS and
                keep Order and
                Delivery truth
                synchronized.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-xs font-bold disabled:opacity-50">
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}

              Refresh
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<Truck />}
            label="Active deliveries"
            value={counts.active}
          />

          <Metric
            icon={<Clock3 />}
            label="Awaiting assignment"
            value={counts.awaiting}
          />

          <Metric
            icon={<Route />}
            label="Live GPS sessions"
            value={counts.tracking}
          />

          <Metric
            icon={<CheckCircle2 />}
            label="Delivered"
            value={counts.delivered}
          />
        </section>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading &&
        !runtime.deliveries
          .length ? (
          <div className="h-96 animate-pulse rounded-[2rem] border bg-muted/30" />
        ) : runtime.deliveries
            .length ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {runtime.deliveries.map(
              delivery => (
                <DeliveryCard
                  key={
                    delivery.id
                  }
                  delivery={
                    delivery
                  }
                  staff={
                    runtime.staff
                  }
                  workspaceId={
                    workspaceId
                  }
                  canManage={
                    canManage
                  }
                  onChanged={
                    replaceDelivery
                  }
                />
              )
            )}
          </section>
        ) : (
          <section className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed bg-card/50 p-8 text-center">
            <div>
              <Truck className="mx-auto size-8 text-muted-foreground" />

              <h2 className="mt-4 font-black">
                No delivery
                records yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Paid orders create
                Delivery records
                during checkout.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function DeliveryCard({
  delivery,
  staff,
  workspaceId,
  canManage,
  onChanged
}: {
  delivery:
    DeliveryRuntimeValue;
  staff:
    DeliveryStaffOption[];
  workspaceId: string;
  canManage: boolean;
  onChanged: (
    delivery:
      DeliveryRuntimeValue
  ) => void;
}) {
  const [
    busy,
    setBusy
  ] =
    useState(false);

  const [
    error,
    setError
  ] =
    useState<string | null>(
      null
    );

  const [
    dispatcherId,
    setDispatcherId
  ] =
    useState(
      delivery.dispatcherId ??
        ''
    );

  const [
    dispatcherName,
    setDispatcherName
  ] =
    useState(
      delivery.dispatcherName ??
        ''
    );

  const [
    dispatcherPhone,
    setDispatcherPhone
  ] =
    useState(
      delivery.dispatcherPhone ??
        ''
    );

  const [
    estimatedArrival,
    setEstimatedArrival
  ] =
    useState('');

  const [
    handover,
    setHandover
  ] =
    useState<{
      accessUrl: string;
      expiresAt: string;
    } | null>(null);

  const nextStatuses =
    transitions[
      delivery.status
    ] ?? [];

  async function assign() {
    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/deliveries/${encodeURIComponent(
            delivery.id
          )}/assign`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                workspaceId,
                dispatcherId:
                  dispatcherId ||
                  null,
                dispatcherName,
                dispatcherPhone,
                estimatedArrival:
                  estimatedArrival
                    ? new Date(
                        estimatedArrival
                      ).toISOString()
                    : null
              })
          }
        );

      const data =
        await readJson<{
          delivery:
            DeliveryRuntimeValue;
        }>(
          response
        );

      onChanged(
        data.delivery
      );
      setHandover(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Assignment failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function issueHandover() {
    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/deliveries/${encodeURIComponent(
            delivery.id
          )}/handover`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                workspaceId
              })
          }
        );

      const data =
        await readJson<HandoverResponse>(
          response
        );

      onChanged(
        data.delivery
      );

      setHandover({
        accessUrl:
          data.accessUrl,
        expiresAt:
          data.expiresAt
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Rider access could not be issued.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(
    nextStatus:
      DeliveryStatusValue
  ) {
    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/deliveries/${encodeURIComponent(
            delivery.id
          )}/status`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                workspaceId,
                nextStatus
              })
          }
        );

      const data =
        await readJson<{
          delivery:
            DeliveryRuntimeValue;
        }>(
          response
        );

      onChanged(
        data.delivery
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Status update failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  const assignable =
    delivery.status ===
      'PENDING' ||
    delivery.status ===
      'FAILED';

  return (
    <article className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-lg">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-lg font-black">
                {
                  delivery.order
                    .orderNumber
                }
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {
                  delivery.order
                    .user.name
                }{' '}
                ·{' '}
                {label(
                  delivery.method
                )}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-[9px] font-black uppercase">
            {label(
              delivery.status
            )}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Info
            icon={<Barcode />}
            label="Tracking code"
            value={
              delivery.trackingCode
            }
          />

          <Info
            icon={<PackageCheck />}
            label="Order total"
            value={currency.format(
              delivery.order
                .total
            )}
          />

          <Info
            icon={<UserRound />}
            label="Dispatcher"
            value={
              delivery.dispatcherName ??
              'Not assigned'
            }
          />

          <Info
            icon={<MapPin />}
            label="Latest location"
            value={
              delivery.lastLocationAt
                ? new Date(
                    delivery.lastLocationAt
                  ).toLocaleString(
                    'en-NG'
                  )
                : 'Waiting'
            }
          />
        </div>

        {delivery.lastLatitude !==
          null &&
        delivery.lastLongitude !==
          null ? (
          <a
            href={`https://www.google.com/maps?q=${delivery.lastLatitude},${delivery.lastLongitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary">
            <MapPin className="size-4" />

            Open latest GPS
            point
          </a>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      {canManage &&
      assignable ? (
        <section className="border-t bg-muted/20 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[.14em]">
            Assign fulfilment
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold">
              Workspace staff

              <select
                value={
                  dispatcherId
                }
                onChange={
                  event =>
                    setDispatcherId(
                      event.target
                        .value
                    )
                }
                className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm">
                <option value="">
                  External or named
                  courier
                </option>

                {staff.map(
                  option => (
                    <option
                      key={
                        option.id
                      }
                      value={
                        option.id
                      }>
                      {
                        option.name
                      }{' '}
                      ·{' '}
                      {
                        option.role
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <Field
              label="Dispatcher name"
              value={
                dispatcherName
              }
              onChange={
                setDispatcherName
              }
            />

            <Field
              label="Phone"
              value={
                dispatcherPhone
              }
              onChange={
                setDispatcherPhone
              }
              type="tel"
            />

            <Field
              label="Estimated arrival"
              value={
                estimatedArrival
              }
              onChange={
                setEstimatedArrival
              }
              type="datetime-local"
            />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void assign()
            }
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-black text-background disabled:opacity-50">
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <UserRound className="size-4" />
            )}

            Assign delivery
          </button>
        </section>
      ) : null}

      {canManage &&
      delivery.status ===
        'ASSIGNED' ? (
        <section className="border-t bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.14em]">
                Secure handover
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Generates a
                single-use,
                30-minute rider
                access URL. This is
                the payload the QR
                renderer will encode.
              </p>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void issueHandover()
              }
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground disabled:opacity-50">
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Barcode className="size-4" />
              )}

              Generate access
            </button>
          </div>

          {handover ? (
            <RiderHandoverQrFrame
              accessUrl={
                handover.accessUrl
              }
              expiresAt={
                handover.expiresAt
              }
              trackingCode={
                delivery.trackingCode
              }
              orderNumber={
                delivery.order
                  .orderNumber
              }
              dispatcherName={
                delivery.dispatcherName
              }
            />
          ) : null}
        </section>
      ) : null}

      {canManage &&
      nextStatuses.length ? (
        <section className="border-t p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[.14em]">
            Routine transition
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {nextStatuses.map(
              status => (
                <button
                  key={
                    status
                  }
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void updateStatus(
                      status
                    )
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-black disabled:opacity-50">
                  <ShieldCheck className="size-3.5" />

                  {label(
                    status
                  )}
                </button>
              )
            )}
          </div>
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
    <article className="rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm">
      <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary [&_svg]:size-4">
        {icon}
      </span>

      <p className="mt-5 text-[10px] text-muted-foreground">
        {metricLabel}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>
    </article>
  );
}

function Info({
  icon,
  label: infoLabel,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/35 p-3">
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.12em] text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {infoLabel}
      </div>

      <p className="mt-2 truncate text-xs font-bold">
        {value}
      </p>
    </div>
  );
}

function Field({
  label: fieldLabel,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
}) {
  return (
    <label className="text-xs font-bold">
      {fieldLabel}

      <input
        type={type}
        value={value}
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
        className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm"
      />
    </label>
  );
}
