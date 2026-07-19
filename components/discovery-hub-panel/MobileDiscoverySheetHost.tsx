'use client';

import { useEffect, useRef, useState } from 'react';

import { useMobileDiscovery } from '@/components/layout/MobileApplicationShell';

import { useFeedExperience } from '@/features/feed-experience';

import MobileDiscoverySheet from './MobileDiscoverySheet';

const MOBILE_DISCOVERY_QUERY = '(max-width: 1023px)';

export default function MobileDiscoverySheetHost() {
  const { intent } = useFeedExperience();

  const { discoveryOpen, openDiscovery, setDiscoveryOpen } = useMobileDiscovery();

  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const lastAutoOpenedProductIdRef = useRef<string | null>(null);

  const activeProductId = intent.type === 'product' ? (intent.targetId ?? null) : null;

  /**
   * Keep the mounted mobile experience synchronized with
   * Tailwind's `lg` breakpoint.
   *
   * Desktop begins at 1024px, so mobile ends at 1023px.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_DISCOVERY_QUERY);

    const synchronizeViewport = () => {
      const mobile = mediaQuery.matches;

      setIsMobileViewport(mobile);

      /**
       * A Sheet is portalled into document.body.
       * It must be explicitly closed when entering desktop.
       */
      if (!mobile) {
        setDiscoveryOpen(false);

        lastAutoOpenedProductIdRef.current = null;
      }
    };

    synchronizeViewport();

    mediaQuery.addEventListener('change', synchronizeViewport);

    return () => {
      mediaQuery.removeEventListener('change', synchronizeViewport);
    };
  }, [setDiscoveryOpen]);

  /**
   * Automatically reveal product information only when
   * the application is actually in its mobile layout.
   */
  useEffect(() => {
    if (!isMobileViewport) {
      return;
    }

    if (!activeProductId) {
      lastAutoOpenedProductIdRef.current = null;

      return;
    }

    if (lastAutoOpenedProductIdRef.current === activeProductId) {
      return;
    }

    lastAutoOpenedProductIdRef.current = activeProductId;

    openDiscovery();
  }, [activeProductId, isMobileViewport, openDiscovery]);

  /**
   * Do not mount the portalled Sheet at all on desktop.
   */
  if (!isMobileViewport) {
    return null;
  }

  return <MobileDiscoverySheet open={discoveryOpen} onOpenChange={setDiscoveryOpen} />;
}
