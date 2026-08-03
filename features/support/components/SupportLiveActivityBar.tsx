'use client';

import {
  CircleUserRound,
  MessagesSquare
} from 'lucide-react';

import {
  cn
} from '@/lib/utils';

import type {
  SupportLivePresenceItem
} from '../supportLiveTypes';

type SupportLiveActivityBarProps = {
  actorUserId: string;
  participants:
    SupportLivePresenceItem[];
  remoteLabel: string;
};

export function SupportLiveActivityBar({
  actorUserId,
  participants,
  remoteLabel
}: SupportLiveActivityBarProps) {
  const remote =
    participants.filter(
      participant =>
        participant.user.id !==
        actorUserId
    );

  const online =
    remote.some(
      participant =>
        participant.active
    );

  const typing =
    remote.some(
      participant =>
        participant.typing
    );

  return (
    <div className="flex min-h-8 items-center gap-2 border-b border-border/60 bg-muted/25 px-4 py-2 text-[10px] font-medium text-muted-foreground">
      <span
        className={cn(
          'relative grid size-6 place-items-center rounded-full border bg-background',
          online
            ? 'border-primary/30 text-primary'
            : 'border-border text-muted-foreground'
        )}>
        <CircleUserRound className="size-3.5" />

        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-background',
            online
              ? 'bg-primary'
              : 'bg-muted-foreground/40'
          )}
        />
      </span>

      {typing ? (
        <span className="inline-flex items-center gap-2 text-foreground">
          <MessagesSquare className="size-3.5" />
          {remoteLabel} is typing
          <span
            aria-hidden="true"
            className="inline-flex gap-0.5">
            <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-.3s]" />
            <span className="size-1 animate-bounce rounded-full bg-current [animation-delay:-.15s]" />
            <span className="size-1 animate-bounce rounded-full bg-current" />
          </span>
        </span>
      ) : (
        <span>
          {online
            ? `${remoteLabel} is online`
            : `${remoteLabel} is not currently active`}
        </span>
      )}
    </div>
  );
}
