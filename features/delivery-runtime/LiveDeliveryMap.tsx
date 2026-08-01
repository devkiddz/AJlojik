'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  StyleSpecification
} from 'maplibre-gl';

import {
  CircleDot,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Navigation
} from 'lucide-react';

import type {
  DeliveryEventValue
} from './deliveryContracts';

import styles from './LiveDeliveryMap.module.css';

const osmStyle:
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

function radians(
  value: number
) {
  return (
    value *
    Math.PI /
    180
  );
}

function haversineMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
) {
  const radius =
    6_371_000;

  const latitudeDelta =
    radians(
      latitudeB -
        latitudeA
    );

  const longitudeDelta =
    radians(
      longitudeB -
        longitudeA
    );

  const a =
    Math.sin(
      latitudeDelta /
        2
    ) **
      2 +
    Math.cos(
      radians(
        latitudeA
      )
    ) *
      Math.cos(
        radians(
          latitudeB
        )
      ) *
      Math.sin(
        longitudeDelta /
          2
      ) **
        2;

  return (
    2 *
    radius *
    Math.atan2(
      Math.sqrt(
        a
      ),
      Math.sqrt(
        1 -
          a
      )
    )
  );
}

export function LiveDeliveryMap({
  latitude,
  longitude,
  lastLocationAt,
  events
}: {
  latitude:
    number |
    null;
  longitude:
    number |
    null;
  lastLocationAt:
    string |
    null;
  events:
    DeliveryEventValue[];
}) {
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

  const coordinateReady =
    latitude !==
      null &&
    longitude !==
      null;

  const [
    loading,
    setLoading
  ] =
    useState(
      coordinateReady
    );

  const [
    error,
    setError
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const movement =
    useMemo(
      () => {
        const points =
          events.filter(
            event =>
              event.latitude !==
                null &&
              event.longitude !==
                null
          );

        if (
          points.length <
          2
        ) {
          return null;
        }

        return haversineMeters(
          points[1]
            .latitude!,
          points[1]
            .longitude!,
          points[0]
            .latitude!,
          points[0]
            .longitude!
        );
      },
      [
        events
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
        mapRef.current
      ) {
        return;
      }

      const container =
        containerRef.current;

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

            const map =
              new maplibre.Map({
                container,
                style:
                  osmStyle,
                center: [
                  longitude,
                  latitude
                ],
                zoom:
                  15,
                attributionControl: {
                  compact:
                    true
                },
                cooperativeGestures:
                  true
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

            map.addControl(
              new maplibre.NavigationControl({
                showCompass:
                  true,
                visualizePitch:
                  true
              }),
              'top-right'
            );

            map.once(
              'load',
              () => {
                if (
                  !disposedRef.current
                ) {
                  setLoading(
                    false
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

                  setLoading(
                    false
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

              setLoading(
                false
              );
            }
          }
        );
    },
    [
      coordinateReady,
      latitude,
      longitude
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
          900,
        essential:
          true
      });
    },
    [
      latitude,
      longitude
    ]
  );

  if (!coordinateReady) {
    return (
      <section className="grid min-h-80 place-items-center rounded-[2rem] border border-dashed bg-muted/20 p-8 text-center">
        <div>
          <Navigation className="mx-auto size-8 text-muted-foreground" />

          <h3 className="mt-4 font-black">
            Waiting for live GPS
          </h3>

          <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
            The map activates
            after the rider starts
            location sharing on
            the handover device.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border bg-card shadow-lg">
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary/75">
            Live rider position
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {lastLocationAt
              ? `Updated ${new Date(
                  lastLocationAt
                ).toLocaleString(
                  'en-NG'
                )}`
              : 'Waiting for timestamp'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-muted px-3 text-[10px] font-black">
            {movement ===
            null ? (
              <CircleDot className="size-3.5" />
            ) : movement <
              8 ? (
              <CircleDot className="size-3.5 text-amber-500" />
            ) : (
              <Navigation className="size-3.5 text-emerald-600" />
            )}

            {movement ===
            null
              ? 'First GPS point'
              : movement <
                  8
                ? 'Rider stationary'
                : `${Math.round(
                    movement
                  )} m movement`}
          </span>

          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-black">
            <ExternalLink className="size-3.5" />

            External map
          </a>
        </div>
      </div>

      <div className={styles.map}>
        <div
          ref={
            containerRef
          }
          className="absolute inset-0"
          aria-label="Live delivery location map"
        />

        {loading ? (
          <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-sm">
            <div className="text-center">
              <LoaderCircle className="mx-auto size-7 animate-spin text-primary" />

              <p className="mt-3 text-xs font-bold">
                Loading live map
              </p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-destructive/20 bg-background/95 p-3 text-xs text-destructive shadow-lg">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />

              {error}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
