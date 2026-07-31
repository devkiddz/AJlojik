import {
  CalendarClock,
  CirclePause,
  History,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

import type { ApprovalTimelineEvent } from '../approvalTypes';

function format(value: string) {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function ApprovalTimeline({ events }: { events: ApprovalTimelineEvent[] }) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-dashed p-5 text-center text-xs text-muted-foreground">
        No lifecycle events have been recorded yet.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map(event => {
        const Icon =
          event.type === 'PAUSED'
            ? CirclePause
            : event.type === 'REVERTED' || event.type === 'REACTIVATED'
              ? RotateCcw
              : event.type === 'DEADLINE_CHANGED'
                ? CalendarClock
                : event.type === 'CREATED'
                  ? History
                  : ShieldCheck;

        return (
          <li key={event.id} className="flex gap-3 rounded-2xl border border-border/60 bg-background/55 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black">{event.type.replaceAll('_', ' ')}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {event.actor?.name ?? 'System'} · {format(event.createdAt)}
              </p>
              {event.fromStatus || event.toStatus ? (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary/70">
                  {event.fromStatus ?? '—'} → {event.toStatus ?? '—'}
                </p>
              ) : null}
              {event.note ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{event.note}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
