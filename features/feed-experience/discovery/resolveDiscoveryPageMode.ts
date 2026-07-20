import type {
  DiscoveryPageMode
} from '@/components/discovery-hub-panel/discoveryHubTypes';

export type DiscoveryRouteRule = {
  matches: (
    pathname: string
  ) => boolean;

  pageMode: DiscoveryPageMode;
};

function matchesRoute(
  pathname: string,
  route: string
): boolean {
  return (
    pathname === route ||
    pathname.startsWith(
      `${route}/`
    )
  );
}

function matchesAccountRoute(
  pathname: string,
  section: string
): boolean {
  return matchesRoute(
    pathname,
    `/account/${section}`
  );
}

/**
 * Core RCENTZ route-to-purpose mapping.
 *
 * More specific routes must remain above their broader owners.
 * Product blueprints can supply additional rules through the
 * optional second argument without editing this core list.
 */
export const coreDiscoveryRouteRules: DiscoveryRouteRule[] = [
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/admin'
      ),
    pageMode: 'admin'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/checkout'
      ),
    pageMode: 'checkout'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/tracking'
      ) ||
      matchesAccountRoute(
        pathname,
        'tracking'
      ),
    pageMode: 'tracking'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/orders'
      ) ||
      matchesAccountRoute(
        pathname,
        'orders'
      ),
    pageMode: 'orders'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/wishlist'
      ) ||
      matchesAccountRoute(
        pathname,
        'wishlist'
      ),
    pageMode: 'wishlist'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/rewards'
      ) ||
      matchesAccountRoute(
        pathname,
        'rewards'
      ),
    pageMode: 'rewards'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/settings'
      ) ||
      matchesAccountRoute(
        pathname,
        'settings'
      ),
    pageMode: 'settings'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/search'
      ),
    pageMode: 'search'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/cart'
      ),
    pageMode: 'cart'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/account'
      ),
    pageMode: 'account'
  },
  {
    matches: pathname =>
      matchesRoute(
        pathname,
        '/store'
      ),
    pageMode: 'store'
  }
];

export function resolveDiscoveryPageMode(
  pathname: string,
  additionalRules: DiscoveryRouteRule[] = []
): DiscoveryPageMode {
  const matchedRule = [
    ...additionalRules,
    ...coreDiscoveryRouteRules
  ].find(
    rule =>
      rule.matches(pathname)
  );

  return (
    matchedRule?.pageMode ??
    'default'
  );
}
