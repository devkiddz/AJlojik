import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ShoppingBag } from 'lucide-react';

import { cn } from '@/lib/utils';

import type {
  CommerceDashboardData,
  CommerceOrder,
  CommerceProduct
} from '../../contracts/customerDashboardTypes';

const compactMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1
});

const PROCESSING = new Set([
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY'
]);

const PROCESSED = new Set([
  'DELIVERED',
  'COMPLETED'
]);

export function RecentViewRows({
  products
}: {
  products: CommerceProduct[];
}) {
  const visible = products.slice(0, 3);

  if (visible.length === 0) {
    return <EmptyJourneyRows label="No recent views" />;
  }

  return visible.map((product, index) => (
    <MiniRecord
      key={product.id}
      href={`/products/${product.slug}`}
      leading={<ProductAvatar product={product} />}
      title={product.name}
      trailing={String(index + 1).padStart(2, '0')}
    />
  ));
}

export function ActivityRows({
  history
}: {
  history: CommerceDashboardData['history'];
}) {
  const visible = history.slice(0, 3);

  if (visible.length === 0) {
    return <EmptyJourneyRows label="No archived activity" />;
  }

  return visible.map((entry, index) => {
    const label = resolveActivityLabel(entry);

    return (
      <MiniRecord
        key={`${label}-${index}`}
        leading={<RecordLabel>{abbreviate(label)}</RecordLabel>}
        title={label}
        trailing={String(index + 1).padStart(2, '0')}
      />
    );
  });
}

export function OrderRows({
  orders
}: {
  orders: CommerceOrder[];
}) {
  const visible = orders.slice(0, 3);

  if (visible.length === 0) {
    return <EmptyJourneyRows label="No order history" />;
  }

  return visible.map(order => {
    const tone = resolveStatusTone(order.status);

    return (
      <MiniRecord
        key={order.id}
        href={`/orders?order=${order.id}`}
        leading={<RecordLabel>{orderCode(order.orderNumber)}</RecordLabel>}
        title={order.orderNumber}
        subtitle={formatLabel(order.status)}
        subtitleClassName={tone.text}
        indicatorClassName={tone.dot}
        trailing={compactMoney.format(order.total)}
      />
    );
  });
}

export function DeliveryRows({
  orders
}: {
  orders: CommerceOrder[];
}) {
  const visible = orders.slice(0, 3);

  if (visible.length === 0) {
    return <EmptyJourneyRows label="No active delivery" />;
  }

  return visible.map(order => {
    const status = order.delivery?.status ?? order.status;
    const progress = resolveDeliveryProgress(status);

    return (
      <Link
        key={order.id}
        href={`/orders?order=${order.id}`}
        className="block rounded-lg border border-border/50 bg-background/65 p-2.5 transition hover:border-primary/25 hover:bg-background">
        <div className="flex items-center gap-2">
          <RecordLabel>{orderCode(order.orderNumber)}</RecordLabel>

          <div className="min-w-0 flex-1">
            <p className="break-words text-xs font-semibold leading-4">
              {order.orderNumber}
            </p>
            <p className="mt-0.5 break-words text-xs text-muted-foreground">
              {formatLabel(status)}
            </p>
          </div>

          <span className="shrink-0 text-xs font-bold">
            {progress}%
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/60">
          <span
            className="block h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Link>
    );
  });
}

export function CartRows({
  items,
  subtotal
}: {
  items: CommerceDashboardData['cartItems'];
  subtotal: number;
}) {
  const visible = items.slice(0, 3);

  if (visible.length === 0) {
    return <EmptyJourneyRows label="Your cart is empty" />;
  }

  return (
    <>
      {visible.map(item => (
        <MiniRecord
          key={item.product.id}
          href={`/products/${item.product.slug}`}
          leading={<ProductAvatar product={item.product} />}
          title={item.product.name}
          subtitle={`Qty ${resolveCartItemQuantity(item)}`}
          trailing={compactMoney.format(item.product.price)}
        />
      ))}

      <div className="flex items-center justify-between rounded-lg border border-amber-500/15 bg-background/70 px-2.5 py-2 text-xs">
        <span className="font-medium text-muted-foreground">
          Total
        </span>
        <span className="font-bold">
          {compactMoney.format(subtotal)}
        </span>
      </div>
    </>
  );
}

function MiniRecord({
  leading,
  title,
  subtitle,
  trailing,
  href,
  subtitleClassName,
  indicatorClassName
}: {
  leading: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: string;
  href?: string;
  subtitleClassName?: string;
  indicatorClassName?: string;
}) {
  const content = (
    <>
      {leading}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          {indicatorClassName ? (
            <span
              className={cn(
                'mt-1.5 size-1.5 shrink-0 rounded-full',
                indicatorClassName
              )}
            />
          ) : null}

          <p className="line-clamp-2 break-words text-xs font-semibold leading-4">
            {title}
          </p>
        </div>

        {subtitle ? (
          <p
            className={cn(
              'mt-0.5 line-clamp-1 break-words text-xs leading-4 text-muted-foreground',
              subtitleClassName
            )}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {trailing ? (
        <span className="max-w-20 shrink-0 break-words text-right text-xs font-bold text-muted-foreground">
          {trailing}
        </span>
      ) : null}
    </>
  );

  const className =
    'flex min-w-0 items-center gap-2.5 rounded-lg border border-border/50 bg-background/65 p-2 transition hover:border-primary/25 hover:bg-background';

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
}

function ProductAvatar({
  product
}: {
  product: CommerceProduct;
}) {
  return (
    <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
      {product.image ? (
        <Image
          src={product.image}
          alt=""
          fill
          sizes="36px"
          className="object-cover"
        />
      ) : (
        <span className="grid size-full place-items-center">
          <ShoppingBag className="size-3.5 text-muted-foreground" />
        </span>
      )}
    </span>
  );
}

function RecordLabel({
  children
}: {
  children: ReactNode;
}) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
      {children}
    </span>
  );
}

function EmptyJourneyRows({
  label
}: {
  label: string;
}) {
  return (
    <div className="grid min-h-28 place-items-center rounded-lg border border-dashed border-border/60 bg-background/35 p-3">
      <div className="text-center">
        <span className="block text-2xl font-bold">0</span>
        <span className="mt-1 block break-words text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

function resolveStatusTone(status: string): {
  text: string;
  dot: string;
} {
  const normalized = status.toUpperCase();

  if (PROCESSED.has(normalized)) {
    return {
      text: 'text-emerald-600 dark:text-emerald-300',
      dot: 'bg-emerald-500'
    };
  }

  if (PROCESSING.has(normalized)) {
    return {
      text: 'text-orange-600 dark:text-orange-300',
      dot: 'bg-orange-500'
    };
  }

  return {
    text: 'text-red-600 dark:text-red-300',
    dot: 'bg-red-500'
  };
}

function resolveDeliveryProgress(status: string): number {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 10;
    case 'CONFIRMED':
      return 20;
    case 'PROCESSING':
      return 35;
    case 'PACKED':
      return 50;
    case 'SHIPPED':
      return 65;
    case 'IN_TRANSIT':
      return 80;
    case 'OUT_FOR_DELIVERY':
      return 90;
    case 'DELIVERED':
    case 'COMPLETED':
      return 100;
    default:
      return 0;
  }
}

function resolveActivityLabel(entry: unknown): string {
  const value = readTextValue(
    entry,
    ['title', 'label', 'action', 'source', 'type']
  );

  return value ? formatLabel(value) : 'Activity';
}

function resolveCartItemQuantity(item: unknown): number {
  const quantity = readNumberValue(item, ['quantity', 'qty', 'count']);
  return Math.max(quantity ?? 1, 1);
}

function readTextValue(
  value: unknown,
  keys: string[]
): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}

function readNumberValue(
  value: unknown,
  keys: string[]
): number | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (
      typeof candidate === 'number' &&
      Number.isFinite(candidate)
    ) {
      return candidate;
    }
  }

  return undefined;
}

function orderCode(orderNumber: string): string {
  const cleaned = orderNumber
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return cleaned.slice(-3) || 'ORD';
}

function abbreviate(value: string): string {
  const words = value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return '—';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}

function formatLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/\b\w/g, character => character.toUpperCase());
}
