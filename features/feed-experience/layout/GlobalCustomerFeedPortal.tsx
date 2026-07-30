'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ArrowLeft, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useFeedExperience } from '../hooks';
import { FeedRenderer } from '../renderers';

const CUSTOMER_ROUTE_CONTENT_ID = 'customer-route-content';
const CUSTOMER_GLOBAL_FEED_SLOT_ID = 'customer-global-feed-slot';

/**
 * Renders the global Product Experience into the customer's central surface.
 *
 * The Discovery Hub owns the preview. Full details are only handed to this
 * surface when the customer explicitly chooses "View full details in Feed".
 * This remains route-independent, so the same handoff works from Account,
 * Wishlist, Cart, Search, Store and every other customer workspace.
 */
export default function GlobalCustomerFeedPortal() {
  const {
    intent,
    productDetailsDisclosure,
    productDetailsControls,
    continueDiscovery
  } = useFeedExperience();

  const [slot, setSlot] = useState<HTMLElement | null>(null);

  const activeProductId =
    intent.type === 'product'
      ? intent.targetId ?? null
      : null;

  const visible = Boolean(
    activeProductId &&
      productDetailsDisclosure.expanded &&
      productDetailsDisclosure.productId === activeProductId
  );

  useEffect(() => {
    setSlot(document.getElementById(CUSTOMER_GLOBAL_FEED_SLOT_ID));
  }, []);

  useEffect(() => {
    const routeContent = document.getElementById(CUSTOMER_ROUTE_CONTENT_ID);

    if (!routeContent) {
      return;
    }

    routeContent.hidden = visible;

    return () => {
      routeContent.hidden = false;
    };
  }, [visible]);

  if (!slot || !visible || !activeProductId) {
    return null;
  }

  const returnToPreviousSurface = (): void => {
    productDetailsControls.collapse(activeProductId);
    continueDiscovery();
  };

  return createPortal(
    <div className="min-h-dvh min-w-0 bg-background px-3 py-3 md:px-4 md:py-4 lg:h-[calc(100dvh-6.5rem)] lg:min-h-0 lg:overflow-hidden">
      <section className="min-w-0 pb-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:rounded-3xl lg:bg-card/50 lg:p-4 lg:scroll-smooth lg:scrollbar-none">
        <header className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm backdrop-blur-xl">
          <Button
            type="button"
            variant="ghost"
            onClick={returnToPreviousSurface}
            className="h-9 gap-2 rounded-full px-3 text-xs font-bold"
          >
            <ArrowLeft className="size-4" />
            Return to previous workspace
          </Button>

          <span className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-[10px] font-bold text-primary sm:inline-flex">
            <Sparkles className="size-3.5" />
            Product experience revealed in Feed
          </span>
        </header>

        <FeedRenderer />
      </section>
    </div>,
    slot
  );
}
