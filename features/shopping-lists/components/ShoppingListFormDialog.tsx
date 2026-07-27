'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ShoppingList } from '../shoppingListTypes';

type Props = {
  open: boolean;
  list?: ShoppingList | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; description?: string }) => Promise<void>;
};

export function ShoppingListFormDialog({ open, list, busy = false, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(list?.name ?? '');
    setDescription(list?.description ?? '');
    setError(null);
  }, [list, open]);

  if (!open) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError('Give this list a clear name.');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        name: cleanName,
        description: description.trim() || undefined
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save this list.');
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="shopping-list-form-title" className="w-full max-w-lg rounded-t-3xl border bg-background p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Shopping list</p>
            <h2 id="shopping-list-form-title" className="mt-1 text-2xl font-semibold tracking-tight">{list ? 'Refine your list' : 'Create a new plan'}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border hover:bg-muted" aria-label="Close dialog"><X className="size-4" /></button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={submit}>
          <label className="block">
            <span className="text-sm font-medium">List name</span>
            <input autoFocus value={name} onChange={event => setName(event.target.value)} maxLength={80} placeholder="Weekend restock" className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Description <span className="font-normal text-muted-foreground">(optional)</span></span>
            <textarea value={description} onChange={event => setDescription(event.target.value)} maxLength={240} rows={4} placeholder="What is this list helping you prepare for?" className="mt-2 w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </label>

          {error ? <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={busy} className="h-11 rounded-xl border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={busy} className={cn('inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background', 'disabled:cursor-not-allowed disabled:opacity-60')}>
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {list ? 'Save changes' : 'Create list'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
