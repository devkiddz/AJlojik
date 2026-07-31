'use client';

import { Check, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import type { StudioDestinationOption } from './studioTypes';

export function StudioDestinationPicker({
  name = 'destination',
  options,
  initialValue = '',
  label = 'Choose destination'
}: {
  name?: string;
  options: StudioDestinationOption[];
  initialValue?: string;
  label?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = options.find(option => `${option.type}:${option.id}` === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;

    return options.filter(option =>
      [option.label, option.description, option.type]
        .filter(Boolean)
        .some(part => String(part).toLowerCase().includes(normalized))
    );
  }, [options, query]);

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 text-left transition hover:bg-muted/40"
      >
        <span className="grid size-12 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {selected?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <ExternalLink className="m-auto size-4 text-muted-foreground" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-xs">
            {selected?.label ?? label}
          </strong>
          <span className="mt-1 block truncate text-[9px] text-muted-foreground">
            {selected?.description ?? 'Product, promotion, collection or Store route'}
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/60 p-5 pr-14">
            <DialogTitle>Commerce destination</DialogTitle>
            <DialogDescription>
              Choose exactly where this campaign should take the customer.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b border-border/60 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search destinations"
                className="h-11 w-full rounded-2xl border border-border/70 bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <button
              type="button"
              onClick={() => {
                setValue('');
                setOpen(false);
              }}
              className="mb-3 w-full rounded-2xl border border-dashed border-border/70 p-3 text-left text-xs font-bold text-muted-foreground"
            >
              No destination
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map(option => {
                const optionValue = `${option.type}:${option.id}`;
                const active = optionValue === value;

                return (
                  <button
                    key={optionValue}
                    type="button"
                    disabled={option.available === false}
                    onClick={() => {
                      setValue(optionValue);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                      active
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                        : 'border-border/60 hover:bg-muted/40',
                      option.available === false && 'cursor-not-allowed opacity-45'
                    )}
                  >
                    <span className="grid size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
                      {option.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={option.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <ExternalLink className="m-auto size-5 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-[8px] font-black uppercase tracking-[0.14em] text-primary/70">
                        {option.type}
                      </span>
                      <strong className="mt-1 block truncate text-xs">
                        {option.label}
                      </strong>
                      <span className="mt-1 block truncate text-[9px] text-muted-foreground">
                        {option.description ?? option.href}
                      </span>
                    </span>
                    {active ? <Check className="size-4 text-primary" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
