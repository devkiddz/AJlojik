import type { ReactNode } from 'react';

import type { CommerceProduct } from '../../contracts/customerDashboardTypes';

import { JourneyCardShell, type JourneyCardTone } from './JourneyCardShell';

import { JourneyProductCollage } from './JourneyProductCollage';

type ProductJourneyCardProps = {
  code: string;
  title: string;
  count: number;
  href: string;
  icon: ReactNode;
  tone: JourneyCardTone;

  products: CommerceProduct[];

  supportingLabel?: string;
  emptyLabel?: string;
};

export function ProductJourneyCard({
  code,
  title,
  count,
  href,
  icon,
  tone,
  products,
  supportingLabel = 'Continue your journey',
  emptyLabel = 'Your products will appear here'
}: ProductJourneyCardProps) {
  return (
    <JourneyCardShell
      code={code}
      title={title}
      href={href}
      icon={icon}
      tone={tone}
      metric={count}
      supportingLabel={count > 0 ? supportingLabel : emptyLabel}>
      <JourneyProductCollage products={products} title={title} fillToFour className="h-full w-full" />
    </JourneyCardShell>
  );
}
