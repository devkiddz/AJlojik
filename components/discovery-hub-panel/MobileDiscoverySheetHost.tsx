'use client';

/* AJ_MOBILE_SHEET_HUB_PREVIEW_AUTHORITY_V1 */

import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  useMobileDiscovery
} from '@/components/layout/MobileApplicationShell';

import {
  useHubProductPreview
} from '@/features/product-experience-state/hubProductPreviewBridge';

import {
  useProductDeepInsight
} from '@/features/product-intelligence';

import MobileDiscoverySheet from './MobileDiscoverySheet';

const MOBILE_DISCOVERY_QUERY =
  '(max-width: 1023px)';

export default function MobileDiscoverySheetHost() {
  const hubProductPreview =
    useHubProductPreview();

  const productDeepInsight =
    useProductDeepInsight();

  const {
    discoveryOpen,
    openDiscovery,
    setDiscoveryOpen
  } = useMobileDiscovery();

  const [
    isMobileViewport,
    setIsMobileViewport
  ] = useState(false);

  const lastOpenedPreviewRequestIdRef =
    useRef<string | null>(null);

  const activePreviewRequestId =
    hubProductPreview?.reveal
      ? hubProductPreview.requestId
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

          lastOpenedPreviewRequestIdRef.current =
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
   * A new Feed preview request opens the Discovery Sheet while
   * the Feed itself remains unchanged. Product Page synchronization
   * uses reveal=false and therefore does not force the mobile Sheet.
   */
  useEffect(() => {
    if (!isMobileViewport) {
      return;
    }

    if (!activePreviewRequestId) {
      lastOpenedPreviewRequestIdRef.current =
        null;

      return;
    }

    if (
      lastOpenedPreviewRequestIdRef.current ===
      activePreviewRequestId
    ) {
      return;
    }

    lastOpenedPreviewRequestIdRef.current =
      activePreviewRequestId;

    openDiscovery();
  }, [
    activePreviewRequestId,
    isMobileViewport,
    openDiscovery
  ]);

  useEffect(() => {
    if (
      !isMobileViewport ||
      !productDeepInsight
    ) {
      return;
    }

    openDiscovery();
  }, [
    isMobileViewport,
    openDiscovery,
    productDeepInsight?.requestId
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
