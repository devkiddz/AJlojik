'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

type HubMapProps = {
  lat: number;
  lng: number;
};

export default function HubMap({ lat, lng }: HubMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 13,
      interactive: false
    });

    const markerElement = document.createElement('div');

    markerElement.className = 'relative grid size-10 place-items-center rounded-full';

    markerElement.innerHTML = `
      <span class="absolute size-10 animate-ping animate-pulse rounded-full bg-emerald-400/30"></span>
      <span class="relative block size-4 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_18px_rgba(34,197,94,0.9)]"></span>
    `;

    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'center'
    })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => {
      marker.remove();
      map.remove();
    };
  }, [lat, lng]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black">
      <div ref={mapRef} className="h-48 w-full" />
    </div>
  );
}
