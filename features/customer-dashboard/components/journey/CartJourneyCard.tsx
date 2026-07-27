import type { ReactNode } from 'react';

import type { CommerceDashboardData, CommerceProduct } from '../../contracts/customerDashboardTypes';

import { JourneyCardShell, type JourneyCardTone } from './JourneyCardShell';

import { JourneyProductCollage } from './JourneyProductCollage';

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
  const products = items
    .map(item => item.product)
    .filter((product): product is CommerceProduct => Boolean(product));

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
      <JourneyProductCollage products={products} title={title} fillToFour className="h-full w-full" />
    </JourneyCardShell>
  );
}
