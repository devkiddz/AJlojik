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
    setDiscoveryOpen
  } = useMobileDiscovery();

  const [
    isMobileViewport,
    setIsMobileViewport
  ] = useState(false);

  const activeProductIntentId =
    intent.type === 'product'
      ? intent.id
      : null;

  const lastObservedProductIntentIdRef =
    useRef<string | null>(
      activeProductIntentId
    );

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

        if (!mobile) {
          setDiscoveryOpen(
            false
          );

          lastObservedProductIntentIdRef.current =
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
   * A newly published Product Experience belongs to the
   * central Feed. Close the mobile Hub so the customer can
   * immediately see that Feed transition.
   *
   * Reopening the Hub while already viewing the same product
   * does not close it again because the intent id is unchanged.
   */
  useEffect(() => {
    if (!isMobileViewport) {
      lastObservedProductIntentIdRef.current =
        activeProductIntentId;

      return;
    }

    const previousIntentId =
      lastObservedProductIntentIdRef.current;

    const newProductExperiencePublished =
      Boolean(
        activeProductIntentId &&
          activeProductIntentId !==
            previousIntentId
      );

    lastObservedProductIntentIdRef.current =
      activeProductIntentId;

    if (
      newProductExperiencePublished &&
      discoveryOpen
    ) {
      setDiscoveryOpen(
        false
      );
    }
  }, [
    activeProductIntentId,
    discoveryOpen,
    isMobileViewport,
    setDiscoveryOpen
  ]);

  if (!isMobileViewport) {
    return null;
  }

  return (
    <MobileDiscoverySheet
      open={discoveryOpen}
      onOpenChange={
        setDiscoveryOpen
      }
    />
  );
}
