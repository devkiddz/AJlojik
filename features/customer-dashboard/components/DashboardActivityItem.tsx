import Image from 'next/image';
import Link from 'next/link';

import {
  ChevronRight,
  History,
  ReceiptText
} from 'lucide-react';

import type {
  DashboardActivityItem
} from '../contracts/customerDashboardTypes';

function formatActivityDate(
  value: string
): string {
  return new Date(
    value
  ).toLocaleDateString(
    'en-NG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );
}

type DashboardActivityItemProps = {
  item: DashboardActivityItem;
};

export function DashboardActivityRow({
  item
}: DashboardActivityItemProps) {
  return (
    <Link
      href={item.href}
      className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3 transition hover:border-primary/25 hover:bg-muted/50">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted text-primary">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : item.kind ===
          'order' ? (
          <ReceiptText className="size-4.5" />
        ) : (
          <History className="size-4.5" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {item.title}
          </span>

          {item.badge ? (
            <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {item.badge}
            </span>
          ) : null}
        </span>

        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {item.description}
        </span>

        <span className="mt-1 block text-xs text-muted-foreground">
          {formatActivityDate(
            item.occurredAt
          )}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
    </Link>
  );
}
