'use client';

import { Brain, Crown, Heart, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CompactDiscoveryItem, CompactDiscoveryItemIcon } from '../discoveryHubTypes';

type CompactDiscoveryCardProps = {
  item: CompactDiscoveryItem;
  onClick?: () => void;
};

const iconMap: Record<CompactDiscoveryItemIcon, React.ComponentType<{ className?: string }>> = {
  cart: ShoppingCart,
  wishlist: Heart,
  recent: TrendingUp,
  recommendation: Sparkles,
  membership: Crown,
  ai: Brain
};

const toneMap = {
  default: 'bg-muted text-muted-foreground',

  primary: 'bg-primary/10 text-primary',

  emerald: 'bg-emerald-500/10 text-emerald-500',

  violet: 'bg-violet-500/10 text-violet-500',

  amber: 'bg-amber-500/10 text-amber-500',

  rose: 'bg-rose-500/10 text-rose-500'
};

export default function CompactDiscoveryCard({ item, onClick }: CompactDiscoveryCardProps) {
  const Icon = iconMap[item.icon];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-border/60 bg-card/70 p-3 text-left transition-all duration-300 hover:border-primary/20 hover:bg-card hover:shadow-lg">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl transition-all',
            toneMap[item.tone]
          )}>
          <Icon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground">{item.label}</p>

            {item.active && <span className="size-2 rounded-full bg-emerald-400" />}
          </div>

          <p className="mt-1 text-sm font-bold text-foreground">{item.value}</p>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
