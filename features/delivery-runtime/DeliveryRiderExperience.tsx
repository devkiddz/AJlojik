'use client';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
  XCircle
} from 'lucide-react';

import {
  useSearchParams
} from 'next/navigation';

import type {
  DeliveryRuntimeValue,
  DeliveryStatusValue,
  RiderAccessInspection,
  RiderSessionValue
} from './deliveryContracts';

const STORAGE_KEY =
  'aj_delivery_rider_session';

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
        'The rider request could not be completed.'
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

function nextActions(
  status:
    DeliveryStatusValue
): DeliveryStatusValue[] {
  switch (status) {
    case 'BARCODE_SCANNED':
      return [
        'PICKED_UP',
        'FAILED'
      ];

    case 'PICKED_UP':
      return [
        'IN_TRANSIT',
        'FAILED'
      ];

    case 'IN_TRANSIT':
      return [
        'ARRIVED',
        'FAILED'
      ];

    case 'ARRIVED':
      return [
        'DELIVERED',
        'FAILED'
      ];

    default:
      return [];
  }
}

function addressText(
  value: unknown
): string {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return 'Delivery address available after handover.';
  }

  const address =
    value as Record<
      string,
      unknown
    >;

  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state
  ]
    .filter(
      item =>
        typeof item ===
          'string' &&
        item.trim()
    )
    .join(', ') ||
    'Store pickup';
}

export function DeliveryRiderExperience() {
  const searchParams =
    useSearchParams();

  const handoverToken =
    searchParams.get(
      'token'
    ) ?? '';

  const [
    inspection,
    setInspection
  ] =
    useState<RiderAccessInspection | null>(
      null
    );

  const [
    delivery,
    setDelivery
  ] =
    useState<DeliveryRuntimeValue | null>(
      null
    );

  const [
    sessionToken,
    setSessionToken
  ] =
    useState('');

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    busy,
    setBusy
  ] =
    useState(false);

  const [
    tracking,
    setTracking
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
    note,
    setNote
  ] =
    useState('');

  const watchIdRef =
    useRef<number | null>(
      null
    );

  const lastSentAtRef =
    useRef(0);

  function clearSession() {
    window.sessionStorage.removeItem(
      STORAGE_KEY
    );

    setSessionToken('');
  }

  async function restoreSession(
    token: string
  ) {
    const response =
      await fetch(
        '/api/delivery-access/session',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify({
              sessionToken:
                token
            }),
          cache:
            'no-store'
        }
      );

    const data =
      await readJson<{
        delivery:
          DeliveryRuntimeValue;
      }>(
        response
      );

    setSessionToken(
      token
    );

    setDelivery(
      data.delivery
    );
  }

  async function inspectToken(
    token: string
  ) {
    const response =
      await fetch(
        '/api/delivery-access/inspect',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify({
              token
            }),
          cache:
            'no-store'
        }
      );

    const data =
      await readJson<{
        inspection:
          RiderAccessInspection;
      }>(
        response
      );

    setInspection(
      data.inspection
    );
  }

  useEffect(
    () => {
      const task =
        window.setTimeout(
          () => {
            setLoading(true);
            setError(null);

            const saved =
              window.sessionStorage.getItem(
                STORAGE_KEY
              );

            const run =
              saved
                ? restoreSession(
                    saved
                  )
                : handoverToken
                  ? inspectToken(
                      handoverToken
                    )
                  : Promise.reject(
                      new Error(
                        'Open the temporary rider handover link supplied by the Store.'
                      )
                    );

            void run
              .catch(
                cause => {
                  clearSession();

                  setError(
                    cause instanceof
                    Error
                      ? cause.message
                      : 'Rider access could not be restored.'
                  );
                }
              )
              .finally(
                () =>
                  setLoading(
                    false
                  )
              );
          },
          0
        );

      return () =>
        window.clearTimeout(
          task
        );
    },
    [
      handoverToken
    ]
  );

  useEffect(
    () =>
      () => {
        if (
          watchIdRef.current !==
          null
        ) {
          navigator.geolocation.clearWatch(
            watchIdRef.current
          );
        }
      },
    []
  );

  async function activate() {
    if (
      !handoverToken ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          '/api/delivery-access/activate',
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                token:
                  handoverToken
              })
          }
        );

      const data =
        await readJson<{
          session:
            RiderSessionValue;
        }>(
          response
        );

      setSessionToken(
        data.session
          .sessionToken
      );

      setDelivery(
        data.session.delivery
      );

      setInspection(null);

      window.sessionStorage.setItem(
        STORAGE_KEY,
        data.session
          .sessionToken
      );

      window.history.replaceState(
        {},
        '',
        '/delivery-access'
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Handover could not be activated.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendPosition(
    position:
      GeolocationPosition
  ) {
    const now =
      Date.now();

    if (
      now -
        lastSentAtRef.current <
      8_000
    ) {
      return;
    }

    lastSentAtRef.current =
      now;

    await fetch(
      '/api/delivery-access/location',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body:
          JSON.stringify({
            sessionToken,
            latitude:
              position.coords
                .latitude,
            longitude:
              position.coords
                .longitude,
            accuracyMeters:
              position.coords
                .accuracy
          })
      }
    ).then(
      response =>
        readJson<{
          accepted:
            boolean;
        }>(
          response
        )
    );
  }

  function startTracking() {
    if (
      !sessionToken ||
      tracking
    ) {
      return;
    }

    if (
      !navigator.geolocation
    ) {
      setError(
        'This device does not provide browser GPS.'
      );

      return;
    }

    setError(null);

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        position => {
          setTracking(true);

          void sendPosition(
            position
          ).catch(
            cause =>
              setError(
                cause instanceof
                Error
                  ? cause.message
                  : 'GPS could not be sent.'
              )
          );
        },
        cause => {
          setTracking(false);
          setError(
            cause.message ||
              'Location permission is required.'
          );
        },
        {
          enableHighAccuracy:
            true,
          maximumAge:
            5_000,
          timeout:
            20_000
        }
      );
  }

  function stopTracking() {
    if (
      watchIdRef.current !==
      null
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current =
        null;
    }

    setTracking(false);
  }

  async function updateStatus(
    nextStatus:
      DeliveryStatusValue
  ) {
    if (
      !delivery ||
      !sessionToken ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const currentPosition =
        await new Promise<GeolocationPosition | null>(
          resolve => {
            if (
              !navigator.geolocation
            ) {
              resolve(
                null
              );

              return;
            }

            navigator.geolocation.getCurrentPosition(
              resolve,
              () =>
                resolve(
                  null
                ),
              {
                enableHighAccuracy:
                  true,
                timeout:
                  10_000,
                maximumAge:
                  10_000
              }
            );
          }
        );

      const response =
        await fetch(
          '/api/delivery-access/status',
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                sessionToken,
                nextStatus,
                note,
                latitude:
                  currentPosition
                    ?.coords
                    .latitude ??
                  null,
                longitude:
                  currentPosition
                    ?.coords
                    .longitude ??
                  null,
                accuracyMeters:
                  currentPosition
                    ?.coords
                    .accuracy ??
                  null
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

      setDelivery(
        data.delivery
      );

      setNote('');

      if (
        [
          'DELIVERED',
          'FAILED',
          'CANCELLED'
        ].includes(
          data.delivery
            .status
        )
      ) {
        stopTracking();
        clearSession();
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'The delivery status could not be updated.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />

          <p className="mt-4 text-sm font-bold">
            Verifying secure
            rider access
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.14),transparent_38%)] px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="rounded-[2rem] border bg-card/85 p-6 shadow-xl sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.14em] text-primary">
            <ShieldCheck className="size-4" />

            Secure delivery
            handover
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Rider delivery
            session
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Handover access is
            single-use. After
            activation, the
            temporary link is
            replaced with a
            device session for GPS
            and delivery progress.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {inspection ? (
          <section className="rounded-[2rem] border bg-card p-6 shadow-lg sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                <PackageCheck className="size-6" />
              </span>

              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-muted-foreground">
                  Handover ready
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {
                    inspection.orderNumber
                  }
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {
                    inspection.recipientName ??
                    'Customer'
                  }{' '}
                  ·{' '}
                  {label(
                    inspection.method
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info
                icon={<Truck />}
                label="Tracking"
                value={
                  inspection.trackingCode
                }
              />

              <Info
                icon={<Clock3 />}
                label="Access expires"
                value={new Date(
                  inspection.expiresAt
                ).toLocaleTimeString(
                  'en-NG'
                )}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                void activate()
              }
              disabled={busy}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-black text-background disabled:opacity-50">
              {busy ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <ShieldCheck className="size-5" />
              )}

              Accept package
              handover
            </button>
          </section>
        ) : null}

        {delivery ? (
          <>
            <section className="rounded-[2rem] border bg-card p-6 shadow-lg sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-muted-foreground">
                    {
                      delivery.trackingCode
                    }
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {
                      delivery.order
                        .orderNumber
                    }
                  </h2>
                </div>

                <span className="rounded-full bg-primary/10 px-3 py-2 text-[10px] font-black text-primary">
                  {label(
                    delivery.status
                  )}
                </span>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl bg-muted/35 p-4">
                <p className="flex items-start gap-3 text-sm leading-6">
                  <MapPin className="mt-1 size-4 shrink-0 text-primary" />

                  {addressText(
                    delivery.order
                      .deliveryAddress
                  )}
                </p>

                <p className="flex items-center gap-3 text-sm">
                  <Truck className="size-4 shrink-0 text-primary" />

                  {
                    delivery.dispatcherName ??
                    'Assigned rider'
                  }
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={
                    tracking
                      ? stopTracking
                      : startTracking
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-black">
                  {tracking ? (
                    <LocateFixed className="size-4 animate-pulse text-emerald-600" />
                  ) : (
                    <Navigation className="size-4" />
                  )}

                  {tracking
                    ? 'GPS sharing active'
                    : 'Start live GPS'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void restoreSession(
                      sessionToken
                    ).catch(
                      cause =>
                        setError(
                          cause instanceof
                          Error
                            ? cause.message
                            : 'Refresh failed.'
                        )
                    )
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-black">
                  <RefreshCw className="size-4" />

                  Refresh
                </button>
              </div>
            </section>

            {nextActions(
              delivery.status
            ).length ? (
              <section className="rounded-[2rem] border bg-card p-6 shadow-lg sm:p-8">
                <p className="text-xs font-black uppercase tracking-[.14em]">
                  Delivery progress
                </p>

                <label className="mt-4 block text-xs font-bold">
                  Rider note
                  (optional)

                  <textarea
                    value={note}
                    onChange={
                      event =>
                        setNote(
                          event.target
                            .value
                        )
                    }
                    rows={3}
                    className="mt-2 w-full resize-none rounded-2xl border bg-background p-3 text-sm"
                  />
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {nextActions(
                    delivery.status
                  ).map(
                    status => (
                      <button
                        key={
                          status
                        }
                        type="button"
                        disabled={
                          busy
                        }
                        onClick={() =>
                          void updateStatus(
                            status
                          )
                        }
                        className={
                          status ===
                          'FAILED'
                            ? 'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-destructive/30 text-sm font-black text-destructive disabled:opacity-50'
                            : 'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-black text-primary-foreground disabled:opacity-50'
                        }>
                        {busy ? (
                          <LoaderCircle className="size-5 animate-spin" />
                        ) : status ===
                          'FAILED' ? (
                          <XCircle className="size-5" />
                        ) : (
                          <CheckCircle2 className="size-5" />
                        )}

                        {label(
                          status
                        )}
                      </button>
                    )
                  )}
                </div>
              </section>
            ) : (
              <section className="rounded-[2rem] border bg-card p-8 text-center shadow-lg">
                <CheckCircle2 className="mx-auto size-10 text-emerald-600" />

                <h2 className="mt-4 text-xl font-black">
                  Session complete
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  This delivery
                  session no longer
                  accepts rider
                  updates.
                </p>
              </section>
            )}
          </>
        ) : null}
      </div>
    </main>
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
    <div className="rounded-2xl bg-muted/35 p-4">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-muted-foreground [&_svg]:size-4">
        {icon}
        {infoLabel}
      </p>

      <p className="mt-2 text-sm font-black">
        {value}
      </p>
    </div>
  );
}
