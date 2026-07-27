import type { ReactNode } from 'react';

import { JourneyCardShell, type JourneyCardTone } from './JourneyCardShell';

type JourneyListCardProps = {
  id?: string;

  code: string;
  title: string;
  href: string;
  icon: ReactNode;
  tone: JourneyCardTone;

  count: number;

  supportingLabel?: string;
  emptyLabel?: string;
  actionLabel?: string;

  children: ReactNode;
};

export function JourneyListCard({
  id,
  code,
  title,
  href,
  icon,
  tone,
  count,
  supportingLabel = 'Recorded journey entries',
  emptyLabel = 'Your journey will appear here',
  actionLabel = 'Open journey',
  children
}: JourneyListCardProps) {
  return (
    <JourneyCardShell
      id={id}
      code={code}
      title={title}
      href={href}
      icon={icon}
      tone={tone}
      metric={count}
      supportingLabel={count > 0 ? supportingLabel : emptyLabel}
      actionLabel={actionLabel}>
      <div className="flex h-full flex-col gap-2 overflow-hidden">{children}</div>
    </JourneyCardShell>
  );
}
