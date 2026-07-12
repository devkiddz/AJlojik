import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { HubWidget } from '../discoveryHubTypes';
import HubMap from './HubMap';
import HubSlider from './HubSlider';

type HubCardProps = {
  widget: HubWidget;
};

const statusStyles = {
  idle: 'bg-background/12 text-primary',
  active: 'bg-violet-500/15 text-violet-300',
  warning: 'bg-accent/20 text-accent',
  success: 'bg-emerald-500/15 text-emerald-300'
};

export default function HubCard({ widget }: HubCardProps) {
  const layout = widget.layout ?? 'summary';

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-primary/12 bg-card/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.25)] transition hover:border-primary/20 hover:bg-card/60',
        widget.accent && `bg-gradient-to-br ${widget.accent}`
      )}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase tracking-wide',
            widget.status ? statusStyles[widget.status] : statusStyles.idle
          )}>
          {widget.meta ?? widget.groupId}
        </span>

        {widget.badge && (
          <span className="rounded-full bg-background/40 px-2.5 py-1 text-[12px] font-semibold text-accent">
            {widget.badge}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-primary">{widget.title}</h3>

      {widget.description && <p className="mt-1 text-sm leading-5 text-primary/55">{widget.description}</p>}

      {layout === 'membership' && (
        <div className="mt-4 rounded-2xl border border-amber-300/15 bg-background/45 p-4">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-amber-300/80">
              AJ LOGIK
            </p>

            <h4 className="mt-3 text-lg font-bold text-primary">Gold Member</h4>

            <p className="mt-1 text-xs text-primary/50">Premium rewards status</p>
          </div>

          {widget.stats?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {widget.stats.map(stat => (
                <div key={stat.label} className="rounded-xl bg-background/40 p-3 text-center">
                  <p className="text-[12px] font-medium text-amber-300/80">{stat.label}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {layout !== 'membership' && widget.stats?.length ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {widget.stats.map(stat => (
            <div key={stat.label} className="rounded-xl bg-background/35 p-3">
              <p className="text-[12px] font-medium text-accent">{stat.label}</p>
              <p className="mt-1 text-sm font-bold text-accent">{stat.value}</p>
              {stat.helper && <p className="mt-0.5 text-[12px] text-primary/45">{stat.helper}</p>}
            </div>
          ))}
        </div>
      ) : null}

      {layout === 'tracking' && widget.location && (
        <div className="mt-4 overflow-hidden rounded-xl border border-primary/12 bg-background">
          {widget.location.coordinates ? (
            <HubMap lat={widget.location.coordinates.lat} lng={widget.location.coordinates.lng} />
          ) : null}

          <div className="p-3">
            <p className="text-xs font-semibold text-primary">{widget.location.title}</p>
            {widget.location.subtitle && (
              <p className="mt-0.5 text-[11px] text-primary/55">{widget.location.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {widget.progress && (
        <div className="mt-4 rounded-xl bg-background/35 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium text-primary/70">{widget.progress.label}</p>
            <p className="text-[11px] font-bold text-primary">{widget.progress.value}%</p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-accent shadow-[0_0_18px_hsl(var(--accent)/0.45)] transition-all duration-700"
              style={{ width: `${widget.progress.value}%` }}
            />
          </div>

          {widget.progress.helper && (
            <p className="mt-2 text-[12px] text-primary/45">{widget.progress.helper}</p>
          )}
        </div>
      )}

      {widget.timeline?.length ? (
        <div className="mt-4 space-y-3 rounded-xl bg-background/35 p-3">
          {widget.timeline.map(item => (
            <div key={item.id} className="flex items-start gap-3">
              {item.completed ? (
                <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
              ) : (
                <Circle className={cn('mt-0.5 size-4', item.active ? 'text-accent' : 'text-primary/25')} />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-primary">{item.label}</p>
                {item.time && <p className="mt-0.5 text-[12px] text-primary/45">{item.time}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {widget.conditions?.length ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {widget.conditions.map(condition => (
            <div key={condition.label} className="rounded-xl bg-background/35 p-2">
              <p className="text-[12px] text-accent">{condition.label}</p>
              <p className="mt-1 text-[11px] font-semibold text-primary">{condition.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {widget.slides?.length ? (
        <HubSlider
          items={widget.slides}
          autoSlide={widget.autoSlide}
          variant={
            layout === 'hero'
              ? 'hero'
              : layout === 'grid'
                ? 'grid'
                : layout === 'minimal-grid'
                  ? 'minimal-grid'
                  : 'strip'
          }
        />
      ) : null}

      {widget.insight && (
        <p className="mt-4 rounded-xl border border-primary/12 bg-background/40 p-3 text-xs leading-5 text-primary/70">
          {widget.insight}
        </p>
      )}

      {widget.action && (
        <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/12 bg-background/50 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-background">
          {widget.action.label}
          <ArrowRight className="size-3" />
        </button>
      )}
    </article>
  );
}
