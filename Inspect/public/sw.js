const VERSION =
  'aj-logik-pwa-v3';

const PRECACHE =
  `${VERSION}:precache`;

const STATIC_CACHE =
  `${VERSION}:static`;

const OFFLINE_URL =
  '/offline';

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.ico',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/maskable-512.png',
  '/pwa/apple-touch-icon.png'
];

self.addEventListener(
  'install',
  event => {
    event.waitUntil(
      caches
        .open(
          PRECACHE
        )
        .then(
          cache =>
            cache.addAll(
              PRECACHE_URLS
            )
        )
    );

    /*
     * Do not skip waiting automatically.
     * AJ Logik lets the customer approve an update instead of
     * interrupting an active commerce experience.
     */
  }
);

self.addEventListener(
  'activate',
  event => {
    event.waitUntil(
      caches
        .keys()
        .then(
          keys =>
            Promise.all(
              keys
                .filter(
                  key =>
                    key.startsWith(
                      'aj-logik-pwa-'
                    ) &&
                    key !==
                      PRECACHE &&
                    key !==
                      STATIC_CACHE
                )
                .map(
                  key =>
                    caches.delete(
                      key
                    )
                )
            )
        )
        .then(
          () =>
            self.clients.claim()
        )
    );
  }
);

self.addEventListener(
  'message',
  event => {
    if (
      event.data?.type ===
      'SKIP_WAITING'
    ) {
      void self.skipWaiting();
    }
  }
);

function isBypassedPath(
  pathname
) {
  return (
    pathname.startsWith(
      '/api/'
    ) ||
    pathname.startsWith(
      '/_next/image'
    ) ||
    pathname.startsWith(
      '/sign-in'
    ) ||
    pathname.startsWith(
      '/sign-up'
    ) ||
    pathname.startsWith(
      '/checkout'
    ) ||
    pathname.startsWith(
      '/payments'
    )
  );
}

async function networkFirstNavigation(
  request
) {
  try {
    return await fetch(
      request
    );
  } catch {
    return (
      await caches.match(
        OFFLINE_URL
      )
    ) ??
      Response.error();
  }
}

async function cacheFirstImmutable(
  request
) {
  const cached =
    await caches.match(
      request
    );

  if (cached) {
    return cached;
  }

  const response =
    await fetch(
      request
    );

  if (
    response.ok
  ) {
    const cache =
      await caches.open(
        STATIC_CACHE
      );

    await cache.put(
      request,
      response.clone()
    );
  }

  return response;
}

async function staleWhileRevalidate(
  request
) {
  const cache =
    await caches.open(
      STATIC_CACHE
    );

  const cached =
    await cache.match(
      request
    );

  const networkRequest =
    fetch(
      request
    )
      .then(
        response => {
          if (
            response.ok
          ) {
            void cache.put(
              request,
              response.clone()
            );
          }

          return response;
        }
      )
      .catch(
        () =>
          cached ??
          Response.error()
      );

  return (
    cached ??
    networkRequest
  );
}

self.addEventListener(
  'fetch',
  event => {
    const request =
      event.request;

    if (
      request.method !==
      'GET'
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    if (
      url.origin !==
      self.location.origin ||
      isBypassedPath(
        url.pathname
      )
    ) {
      return;
    }

    if (
      request.mode ===
      'navigate'
    ) {
      event.respondWith(
        networkFirstNavigation(
          request
        )
      );

      return;
    }

    if (
      url.pathname.startsWith(
        '/_next/static/'
      )
    ) {
      event.respondWith(
        cacheFirstImmutable(
          request
        )
      );

      return;
    }

    const isPWAAsset =
      url.pathname.startsWith(
        '/pwa/'
      ) ||
      url.pathname ===
        '/manifest.webmanifest' ||
      url.pathname ===
        '/favicon.ico';

    const isApplicationAsset =
      /\.(?:css|js|woff2?)$/i.test(
        url.pathname
      );

    if (
      isPWAAsset ||
      isApplicationAsset
    ) {
      event.respondWith(
        staleWhileRevalidate(
          request
        )
      );
    }

    /*
     * Product images and dynamic media are deliberately not stored
     * by this service worker. Browser/CDN caching may still apply,
     * but the PWA does not promote stale product imagery to offline truth.
     */
  }
);
