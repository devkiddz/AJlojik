'use client';

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  useMobileDiscovery
} from '@/components/layout/MobileApplicationShell';

import {
  useFeedExperience
} from '@/features/feed-experience';

import MobileDiscoverySheet from './MobileDiscoverySheet';

const MOBILE_DISCOVERY_QUERY =
  '(max-width: 1023px)';

export default function MobileDiscoverySheetHost() {
  const {
    intent
  } = useFeedExperience();

  const {
    discoveryOpen,
    openDiscovery,
    setDiscoveryOpen
  } = useMobileDiscovery();

  const [
    isMobileViewport,
    setIsMobileViewport
  ] = useState(false);

  const lastOpenedProductIntentIdRef =
    useRef<string | null>(null);

  const activeProductIntentId =
    intent.type === 'product'
      ? intent.id
      : null;

  /**
   * Keep the mounted mobile experience synchronized with
   * Tailwind's `lg` breakpoint.
   */
  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        MOBILE_DISCOVERY_QUERY
      );

    const synchronizeViewport =
      () => {
        const mobile =
          mediaQuery.matches;

        setIsMobileViewport(
          mobile
        );

        /**
         * The Sheet is portalled into document.body and must
         * be explicitly dismissed when desktop takes over.
         */
        if (!mobile) {
          setDiscoveryOpen(false);

          lastOpenedProductIntentIdRef.current =
            null;
        }
      };

    synchronizeViewport();

    mediaQuery.addEventListener(
      'change',
      synchronizeViewport
    );

    return () => {
      mediaQuery.removeEventListener(
        'change',
        synchronizeViewport
      );
    };
  }, [setDiscoveryOpen]);

  /**
   * Mobile product selection is Hub-first.
   *
   * A newly published Product Experience opens the Discovery
   * Sheet and lets ActiveProductWidget provide the preview and
   * commerce workspace. The Sheet closes only when that widget
   * explicitly hands full details to the central Feed.
   */
  useEffect(() => {
    if (!isMobileViewport) {
      return;
    }

    if (!activeProductIntentId) {
      lastOpenedProductIntentIdRef.current =
        null;

      return;
    }

    if (
      lastOpenedProductIntentIdRef.current ===
      activeProductIntentId
    ) {
      return;
    }

    lastOpenedProductIntentIdRef.current =
      activeProductIntentId;

    openDiscovery();
  }, [
    activeProductIntentId,
    isMobileViewport,
    openDiscovery
  ]);

  if (!isMobileViewport) {
    return null;
  }

  return (
    <MobileDiscoverySheet
      open={discoveryOpen}
      onOpenChange={setDiscoveryOpen}
    />
  );
}
