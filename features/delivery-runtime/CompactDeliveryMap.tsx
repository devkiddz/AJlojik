'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import Link from 'next/link';

import {
  ArrowUpRight,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Radio,
  RefreshCw
} from 'lucide-react';

import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  StyleSpecification
} from 'maplibre-gl';

import {
  cn
} from '@/lib/utils';

import styles from './CompactDeliveryMap.module.css';

const TERMINAL_STATUSES =
  new Set([
    'DELIVERED',
    'FAILED',
    'CANCELLED'
  ]);

const openStreetMapStyle:
  StyleSpecification = {
    version:
      8,
    sources: {
      openStreetMap: {
        type:
          'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize:
          256,
        attribution:
          '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id:
          'openStreetMap',
        type:
          'raster',
        source:
          'openStreetMap'
      }
    ]
  };

type DeliverySnapshot = {
  latitude:
    number |
    null;
  longitude:
    number |
    null;
  lastLocationAt:
    string |
    null;
  status:
    string;
  trackingEnabled:
    boolean;
};

type CompactDeliveryMapProps = {
  orderId:
    string;
  workspaceId:
    string;
  initialLatitude:
    number |
    null;
  initialLongitude:
    number |
    null;
  initialLastLocationAt:
    string |
    null;
  initialStatus:
    string;
  initialTrackingEnabled:
    boolean;
  variant?:
    'hub' |
    'journey';
};

function readableStatus(
  value: string
) {
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
      'The latest Delivery location could not be loaded.'
    );
  }

  return payload;
}

export function CompactDeliveryMap({
  orderId,
  workspaceId,
  initialLatitude,
  initialLongitude,
  initialLastLocationAt,
  initialStatus,
  initialTrackingEnabled,
  variant =
    'hub'
}: CompactDeliveryMapProps) {
  const [
    snapshot,
    setSnapshot
  ] =
    useState<DeliverySnapshot>({
      latitude:
        initialLatitude,
      longitude:
        initialLongitude,
      lastLocationAt:
        initialLastLocationAt,
      status:
        initialStatus,
      trackingEnabled:
        initialTrackingEnabled
    });

  const [
    mapReady,
    setMapReady
  ] =
    useState(
      false
    );

  const [
    refreshing,
    setRefreshing
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

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<MapLibreMap | null>(
      null
    );

  const markerRef =
    useRef<MapLibreMarker | null>(
      null
    );

  const disposedRef =
    useRef(
      false
    );

  const initializingRef =
    useRef(
      false
    );

  const {
    latitude,
    longitude,
    lastLocationAt,
    status,
    trackingEnabled
  } =
    snapshot;

  const coordinateReady =
    latitude !==
      null &&
    longitude !==
      null;

  const refresh =
    useCallback(
      async (
        quiet =
          false
      ) => {
        if (
          !workspaceId ||
          !orderId
        ) {
          return;
        }

        if (!quiet) {
          setRefreshing(
            true
          );
        }

        try {
          const response =
            await fetch(
              `/api/orders/${encodeURIComponent(
                orderId
              )}?workspaceId=${encodeURIComponent(
                workspaceId
              )}`,
              {
                cache:
                  'no-store',
                credentials:
                  'same-origin'
              }
            );

          const data =
            await readJson<{
              order: {
                delivery: {
                  status:
                    string;
                  trackingEnabled:
                    boolean;
                  lastLatitude:
                    number |
                    null;
                  lastLongitude:
                    number |
                    null;
                  lastLocationAt:
                    string |
                    null;
                } |
                null;
              };
            }>(
              response
            );

          if (
            data.order.delivery
          ) {
            setSnapshot({
              latitude:
                data.order.delivery
                  .lastLatitude,
              longitude:
                data.order.delivery
                  .lastLongitude,
              lastLocationAt:
                data.order.delivery
                  .lastLocationAt,
              status:
                data.order.delivery
                  .status,
              trackingEnabled:
                data.order.delivery
                  .trackingEnabled
            });
          }

          setError(
            null
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'The latest Delivery location could not be loaded.'
          );
        } finally {
          if (!quiet) {
            setRefreshing(
              false
            );
          }
        }
      },
      [
        orderId,
        workspaceId
      ]
    );

  useEffect(
    () => {
      const start =
        window.setTimeout(
          () =>
            void refresh(
              true
            ),
          0
        );

      const active =
        !TERMINAL_STATUSES.has(
          status
        );

      const interval =
        active
          ? window.setInterval(
              () =>
                void refresh(
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
      refresh,
      status
    ]
  );

  useEffect(
    () => {
      disposedRef.current =
        false;

      return () => {
        disposedRef.current =
          true;

        markerRef.current?.remove();

        mapRef.current?.remove();

        markerRef.current =
          null;

        mapRef.current =
          null;
      };
    },
    []
  );

  useEffect(
    () => {
      if (
        !coordinateReady ||
        latitude ===
          null ||
        longitude ===
          null ||
        !containerRef.current ||
        mapRef.current ||
        initializingRef.current
      ) {
        return;
      }

      const container =
        containerRef.current;

      initializingRef.current =
        true;

      void import(
        'maplibre-gl'
      )
        .then(
          module => {
            if (
              disposedRef.current ||
              !container.isConnected ||
              mapRef.current
            ) {
              return;
            }

            const maplibre =
              module;

            const interactive =
              variant ===
              'journey';

            const map =
              new maplibre.Map({
                container,
                style:
                  openStreetMapStyle,
                center: [
                  longitude,
                  latitude
                ],
                zoom:
                  variant ===
                  'journey'
                    ? 15
                    : 14,
                interactive,
                attributionControl: {
                  compact:
                    true
                },
                cooperativeGestures:
                  interactive
              });

            const marker =
              new maplibre.Marker()
                .setLngLat([
                  longitude,
                  latitude
                ])
                .addTo(
                  map
                );

            if (
              interactive
            ) {
              map.addControl(
                new maplibre.NavigationControl({
                  showCompass:
                    true,
                  visualizePitch:
                    true
                }),
                'top-right'
              );
            }

            map.once(
              'load',
              () => {
                if (
                  !disposedRef.current
                ) {
                  setMapReady(
                    true
                  );
                }
              }
            );

            map.on(
              'error',
              event => {
                if (
                  !disposedRef.current
                ) {
                  setError(
                    event.error?.message ??
                    'The live map could not be loaded.'
                  );

                  setMapReady(
                    true
                  );
                }
              }
            );

            mapRef.current =
              map;

            markerRef.current =
              marker;
          }
        )
        .catch(
          cause => {
            if (
              !disposedRef.current
            ) {
              setError(
                cause instanceof
                Error
                  ? cause.message
                  : 'The live map could not be initialized.'
              );

              setMapReady(
                true
              );
            }
          }
        )
        .finally(
          () => {
            initializingRef.current =
              false;
          }
        );
    },
    [
      coordinateReady,
      latitude,
      longitude,
      variant
    ]
  );

  useEffect(
    () => {
      if (
        latitude ===
          null ||
        longitude ===
          null ||
        !mapRef.current ||
        !markerRef.current
      ) {
        return;
      }

      markerRef.current.setLngLat([
        longitude,
        latitude
      ]);

      mapRef.current.easeTo({
        center: [
          longitude,
          latitude
        ],
        duration:
          800,
        essential:
          true
      });
    },
    [
      latitude,
      longitude
    ]
  );

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-primary/12 bg-background/45',
        variant ===
          'journey'
          ? 'shadow-sm'
          : null
      )}>
      <header className="flex min-w-0 items-center justify-between gap-3 border-b border-primary/10 px-3 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-primary/55">
            <Radio
              className={cn(
                'size-3.5',
                trackingEnabled
                  ? 'animate-pulse text-emerald-500'
                  : 'text-primary/40'
              )}
            />

            Live delivery map
          </p>

          <p className="mt-1 truncate text-[10px] text-primary/45">
            {lastLocationAt
              ? `GPS updated ${new Date(
                  lastLocationAt
                ).toLocaleString(
                  'en-NG'
                )}`
              : trackingEnabled
                ? 'Waiting for the first GPS position'
                : 'Waiting for rider tracking'}
          </p>
        </div>

        <button
          type="button"
          disabled={
            refreshing
          }
          onClick={() =>
            void refresh()
          }
          className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/12 text-primary/60 transition hover:bg-primary/10 disabled:opacity-50"
          aria-label="Refresh live delivery location">
          {refreshing ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
        </button>
      </header>

      {coordinateReady ? (
        <div
          className={cn(
            styles.map,
            variant ===
              'journey'
              ? styles.journey
              : null
          )}>
          <div
            ref={
              containerRef
            }
            className="absolute inset-0"
            aria-label="Current rider location"
          />

          {!mapReady ? (
            <div className="absolute inset-0 grid place-items-center bg-background/65 backdrop-blur-sm">
              <div className="text-center">
                <LoaderCircle className="mx-auto size-6 animate-spin text-primary" />

                <p className="mt-2 text-[10px] font-bold text-primary/60">
                  Loading rider
                  position
                </p>
              </div>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
            <span className="inline-flex max-w-[70%] items-center gap-2 rounded-full bg-background/90 px-3 py-2 text-[9px] font-black shadow-lg backdrop-blur">
              <LocateFixed className="size-3.5 shrink-0 text-emerald-600" />

              <span className="truncate">
                {readableStatus(
                  status
                )}
              </span>
            </span>

            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto grid size-9 shrink-0 place-items-center rounded-full bg-background/95 text-foreground shadow-lg backdrop-blur"
              aria-label="Open rider position in external map">
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'grid place-items-center px-4 text-center',
            variant ===
              'journey'
              ? 'min-h-72'
              : 'min-h-44'
          )}>
          <div>
            {trackingEnabled ? (
              <Navigation className="mx-auto size-6 animate-pulse text-emerald-500" />
            ) : (
              <MapPin className="mx-auto size-6 text-primary/35" />
            )}

            <p className="mt-3 text-xs font-bold text-primary">
              {trackingEnabled
                ? 'Waiting for rider GPS'
                : 'Live map will activate here'}
            </p>

            <p className="mt-1 max-w-xs text-[10px] leading-5 text-primary/45">
              {trackingEnabled
                ? 'The rider session is active, but the first location point has not arrived yet.'
                : 'The map appears automatically when the rider starts location sharing.'}
            </p>
          </div>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 px-3 py-3">
        <span className="inline-flex items-center gap-2 text-[9px] font-semibold text-primary/45">
          <span
            className={cn(
              'size-2 rounded-full',
              trackingEnabled
                ? 'animate-pulse bg-emerald-500'
                : 'bg-primary/20'
            )}
          />

          {trackingEnabled
            ? 'Live polling every 10 seconds'
            : readableStatus(
                status
              )}
        </span>

        <Link
          href={`/orders/${encodeURIComponent(
            orderId
          )}`}
          className="inline-flex h-8 items-center gap-2 rounded-full bg-primary px-3 text-[9px] font-black text-background">
          Full tracking

          <ArrowUpRight className="size-3.5" />
        </Link>
      </footer>

      {error ? (
        <p className="border-t border-destructive/15 bg-destructive/5 px-3 py-2 text-[9px] leading-4 text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
