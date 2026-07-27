import Link from 'next/link';
import type { ReactNode } from 'react';

import { ArrowUpRight, Clock3, History, PackageCheck, ShoppingBag, Truck } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CustomerDashboardView } from '../../view/resolveCustomerDashboardView';

type DashboardActivityHubProps = {
  view: CustomerDashboardView;
};

type SignalTone = 'slate' | 'rose' | 'amber' | 'emerald' | 'violet';

const signalToneStyles: Record<
  SignalTone,
  {
    icon: string;
    metric: string;
  }
> = {
  slate: {
    icon: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    metric: 'text-slate-700 dark:text-slate-200'
  },

  rose: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
    metric: 'text-rose-700 dark:text-rose-200'
  },

  amber: {
    icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    metric: 'text-amber-700 dark:text-amber-200'
  },

  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    metric: 'text-emerald-700 dark:text-emerald-200'
  },

  violet: {
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
    metric: 'text-violet-700 dark:text-violet-200'
  }
};

export function DashboardActivityHub({ view }: DashboardActivityHubProps) {
  const latestOrder = view.orders[0];

  const latestProduct = view.recentProducts[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <header className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Activity Tracking Hub</p>

            <h2 className="mt-1 text-lg font-bold">Current signals</h2>
          </div>

          <span className="rounded-lg bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">ATH</span>
        </div>
      </header>

      <div className="space-y-2 p-3">
        <HubItem
          icon={<Clock3 />}
          label="Recent views"
          value={view.recentProducts.length}
          href="/dashboard/journey/recent-views"
          tone="slate"
        />

        <HubItem
          icon={<History />}
          label="Activity"
          value={view.history.length}
          href="/dashboard/journey/activity"
          tone="rose"
        />

        <HubItem
          icon={<ShoppingBag />}
          label="Cart"
          value={view.cartQuantity}
          href="/dashboard/journey/cart"
          tone="amber"
        />

        <HubItem
          icon={<Truck />}
          label="Deliveries"
          value={view.activeDeliveries.length}
          href="/dashboard/journey/deliveries"
          tone="emerald"
        />

        <HubItem
          icon={<PackageCheck />}
          label="Orders"
          value={view.orders.length}
          href="/dashboard/journey/orders"
          tone="violet"
        />
      </div>

      <div className="border-t border-border/50 p-3">
        <p className="text-xs font-semibold text-muted-foreground">Latest</p>

        <div className="mt-2 space-y-2">
          <SignalRow
            label={latestProduct?.name ?? 'No recent product'}
            href={latestProduct ? `/products/${latestProduct.slug}` : '/store'}
          />

          <SignalRow
            label={latestOrder?.orderNumber ?? 'No recent order'}
            href={latestOrder ? `/orders?order=${latestOrder.id}` : '/orders'}
          />
        </div>
      </div>
    </section>
  );
}

function HubItem({
  icon,
  label,
  value,
  href,
  tone
}: {
  icon: ReactNode;
  label: string;
  value: number;
  href: string;
  tone: SignalTone;
}) {
  const styles = signalToneStyles[tone];

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background/65 p-3 transition hover:border-primary/25 hover:bg-background">
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-xl transition [&_svg]:size-4',
          styles.icon
        )}>
        {icon}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs font-semibold">{label}</span>

      <span className={cn('text-lg font-bold leading-none transition', styles.metric)}>{value}</span>
    </Link>
  );
}

function SignalRow({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/65 px-3 py-2 text-xs transition hover:border-primary/25 hover:bg-background">
      <span className="line-clamp-1 min-w-0 font-semibold">{label}</span>

      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
    </Link>
  );
}
