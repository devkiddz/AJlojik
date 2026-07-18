// components/promos/PromoCountdown.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Timer } from 'lucide-react';

type Props = {
  startsAt?: string;
  endsAt?: string;
  compact?: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function getTimeLeft(endsAt?: string): TimeLeft {
  if (!endsAt) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: false
    };
  }

  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true
    };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false
  };
}

export default function PromoCountdown({ startsAt, endsAt, compact = false }: Props) {
  const [clock, setClock] = useState<{
    endsAt?: string;
    value: TimeLeft;
  }>(() => ({
    endsAt,
    value: getTimeLeft(endsAt)
  }));

  const timeLeft = clock.endsAt === endsAt ? clock.value : getTimeLeft(endsAt);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock({
        endsAt,
        value: getTimeLeft(endsAt)
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [endsAt]);

  const hasSchedule = Boolean(startsAt || endsAt);

  const statusLabel = useMemo(() => {
    if (timeLeft.expired) return 'Promo ended';
    if (!hasSchedule) return 'Limited time promo';
    return 'Promo ends in';
  }, [hasSchedule, timeLeft.expired]);

  if (compact) {
    return (
      <div className="text-sm countdown-glow inline-flex w-fit max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md">
        <Timer className="h-3 w-3" />

        {timeLeft.expired ? (
          <span>Ended</span>
        ) : endsAt ? (
          <span>
            {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m
          </span>
        ) : (
          <span>Limited time</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Timer className="h-5 w-5 text-secondary" />
        <div>
          <p className="text-sm font-bold">{statusLabel}</p>
          {endsAt ? (
            <p className="text-xs text-muted-foreground">Ends {new Date(endsAt).toLocaleDateString()}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          ['Days', timeLeft.days],
          ['Hours', timeLeft.hours],
          ['Minutes', timeLeft.minutes],
          ['Seconds', timeLeft.seconds]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-muted p-3 text-center">
            <p className="text-xl font-black md:text-2xl">{String(value).padStart(2, '0')}</p>
            <p className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
