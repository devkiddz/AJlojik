'use client';

import {
  useEffect
} from 'react';

import {
  publishCustomerExperienceIntent
} from './customerExperienceEvents';

type CustomerExperienceRouteMarkerProps = {
  title: string;
  subtitle?: string;
  surface: string;
  categorySlug?: string;
};

export function CustomerExperienceRouteMarker({
  title,
  subtitle,
  surface,
  categorySlug = 'all'
}: CustomerExperienceRouteMarkerProps) {
  useEffect(() => {
    const route =
      `${window.location.pathname}${window.location.search}`;

    publishCustomerExperienceIntent({
      id:
        `route:${route}:${surface}:${Date.now()}`,

      type:
        'home',

      source:
        'route',

      categorySlug,

      route,

      surface,

      title,

      ...(subtitle
        ? {
            subtitle
          }
        : {}),

      createdAt:
        new Date().toISOString()
    });
  }, [
    categorySlug,
    subtitle,
    surface,
    title
  ]);

  return null;
}
