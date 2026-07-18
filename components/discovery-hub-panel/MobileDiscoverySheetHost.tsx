'use client';

import { useEffect, useRef } from 'react';

import { useMobileDiscovery } from '@/components/layout/MobileApplicationShell';

import { useFeedExperience } from '@/features/feed-experience';

import MobileDiscoverySheet from './MobileDiscoverySheet';

export default function MobileDiscoverySheetHost() {
  const { intent } = useFeedExperience();

  const { discoveryOpen, openDiscovery, setDiscoveryOpen } = useMobileDiscovery();

  const lastAutoOpenedProductIdRef = useRef<string | null>(null);

  const activeProductId = intent.type === 'product' ? (intent.targetId ?? null) : null;

  /*
   * Automatically reveal the mobile Hub when
   * the active product changes.
   *
   * Because this component is inside the real
   * FeedExperienceProvider, it receives the same
   * intent as the central feed.
   */
  useEffect(() => {
    if (!activeProductId) {
      lastAutoOpenedProductIdRef.current = null;

      return;
    }

    if (lastAutoOpenedProductIdRef.current === activeProductId) {
      return;
    }

    lastAutoOpenedProductIdRef.current = activeProductId;

    openDiscovery();
  }, [activeProductId, openDiscovery]);

  return <MobileDiscoverySheet open={discoveryOpen} onOpenChange={setDiscoveryOpen} />;
}
