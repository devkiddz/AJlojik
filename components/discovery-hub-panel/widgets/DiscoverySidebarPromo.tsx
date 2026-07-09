'use client';

import { Flame } from 'lucide-react';

import { promos } from '@/data/promos';
import PromoCountdown from '@/components/promos/PromoCountdown';
import { Button } from '@/components/ui/button';
import { useDiscovery } from '@/components/discovery/DiscoveryProvider';

export default function DiscoverySidebarPromo() {
  const { onPromoPreview } = useDiscovery();

  const activePromo = promos.filter(promo => promo.active).sort((a, b) => a.priority - b.priority)[0];

  if (!activePromo) return null;

  return (
    <section className="rounded-3xl border bg-card p-3">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-secondary" />

        <h3 className="text-sm font-black">Active Campaign</h3>
      </div>

      <div className="rounded-2xl bg-muted/60 p-3">
        <span
          className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold"
          style={{
            backgroundColor: `${activePromo.theme?.accent}25`,
            color: activePromo.theme?.accent
          }}>
          {activePromo.badge}
        </span>

        <h4 className="mt-3 line-clamp-1 text-sm font-black">{activePromo.title}</h4>

        {activePromo.subtitle ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{activePromo.subtitle}</p>
        ) : null}

        <div className="mt-3">
          <PromoCountdown startsAt={activePromo.startsAt} endsAt={activePromo.endsAt} compact />
        </div>

        <Button
          size="sm"
          className="mt-3 h-8 w-full rounded-full text-xs"
          onClick={() => onPromoPreview?.(activePromo.id)}>
          View Campaign
        </Button>
      </div>
    </section>
  );
}
