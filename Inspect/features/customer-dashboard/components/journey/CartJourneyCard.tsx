import type { ReactNode } from 'react';

import type { CommerceDashboardData } from '../../contracts/customerDashboardTypes';

import { JourneyCardShell, type JourneyCardTone } from './JourneyCardShell';
import { CartRows } from './JourneyRows';

type CartJourneyCardProps = {
  code: string;
  title: string;
  count: number;
  href: string;
  icon: ReactNode;
  tone: JourneyCardTone;

  items: CommerceDashboardData['cartItems'];
  subtotal: number;
};

export function CartJourneyCard({
  code,
  title,
  count,
  href,
  icon,
  tone,
  items,
  subtotal
}: CartJourneyCardProps) {
  const formattedSubtotal = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(subtotal);

  return (
    <JourneyCardShell
      code={code}
      title={title}
      href={href}
      icon={icon}
      tone={tone}
      metric={count}
      supportingLabel={count > 0 ? `${formattedSubtotal} subtotal` : 'Your cart is currently empty'}>
      <div className="flex h-full flex-col gap-1.5 overflow-hidden">
        <CartRows items={items} subtotal={subtotal} compact />
      </div>
    </JourneyCardShell>
  );
}
