'use client';

import { Check, ListPlus, LoaderCircle, Plus, X } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { createPortal } from 'react-dom';

import type { ProductType, ProductVariantType } from '@/types/types';

import { useOptionalShoppingLists } from '../client/ShoppingListProvider';

import { ShoppingListFormDialog } from './ShoppingListFormDialog';

type Props = {
  open: boolean;
  product: ProductType;
  variant?: ProductVariantType | null;
  onClose: () => void;
};

export function AddToShoppingListDialog({ open, product, variant, onClose }: Props) {
  const searchParams = useSearchParams();
  const context = useOptionalShoppingLists();

  const [mounted, setMounted] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);

  const [success, setSuccess] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const preferredListId = searchParams.get('shoppingList');

  const selectedVariant = useMemo(
    () => variant ?? product.variants.find(item => item.stockLeft > 0) ?? product.variants[0] ?? null,
    [product.variants, variant]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setSuccess(null);
      setError(null);
      setCreating(false);

      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !creating) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [creating, onClose, open]);

  if (!mounted || !open || !context) {
    return null;
  }

  const { lists, mutating, createList, addItem } = context;

  const orderedLists = preferredListId
    ? [...lists].sort((first, second) => {
        if (first.id === preferredListId) return -1;
        if (second.id === preferredListId) return 1;
        return first.position - second.position;
      })
    : lists;

  async function addToList(listId: string): Promise<void> {
    if (mutating || !selectedVariant) {
      return;
    }

    setSelectedId(listId);
    setSuccess(null);
    setError(null);

    try {
      await addItem(listId, {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: 1
      });

      setSuccess(listId);

      window.setTimeout(() => {
        onClose();
      }, 650);
    } catch (addError) {
      const message =
        addError instanceof Error ? addError.message : 'Unable to add this product to the shopping list.';

      setError(message);
    } finally {
      setSelectedId(null);
    }
  }

  const dialog = (
    <>
      <div
        className="
          fixed inset-0 z-[110]
          flex items-end justify-center
          bg-black/55
          backdrop-blur-sm
          sm:items-center
          sm:p-6
        "
        onMouseDown={event => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}>
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="shopping-list-dialog-title"
          className="
            w-full max-w-lg
            rounded-t-3xl
            border bg-background
            p-5 shadow-2xl
            sm:rounded-3xl
            sm:p-6
          "
          onMouseDown={event => {
            event.stopPropagation();
          }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Save with purpose
              </p>

              <h2 id="shopping-list-dialog-title" className="mt-1 text-xl font-semibold tracking-tight">
                Add to Shopping List
              </h2>

              <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{product.name}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                grid size-10 shrink-0
                place-items-center
                rounded-full border
                transition-colors
                hover:bg-muted
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
              "
              aria-label="Close">
              <X className="size-4" />
            </button>
          </div>

          {error ? (
            <div
              role="alert"
              className="
                mt-4 rounded-xl
                border border-destructive/30
                bg-destructive/10
                px-3 py-2
                text-sm text-destructive
              ">
              {error}
            </div>
          ) : null}

          <div className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
            {lists.length > 0 ? (
              orderedLists.map(list => {
                const isBusy = mutating && selectedId === list.id;

                const done = success === list.id;

                return (
                  <button
                    key={list.id}
                    type="button"
                    disabled={mutating}
                    onClick={() => {
                      void addToList(list.id);
                    }}
                    className="
                      flex w-full
                      items-center justify-between
                      gap-4 rounded-2xl
                      border p-4
                      text-left
                      transition
                      hover:border-foreground/25
                      hover:bg-muted/40
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-ring
                    ">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{list.name}</span>

                      <span className="mt-1 block text-xs text-muted-foreground">
                        {list.id === preferredListId ? 'Selected plan · ' : ''}
                        {list.itemCount} {list.itemCount === 1 ? 'product' : 'products'}
                      </span>
                    </span>

                    <span className="grid size-9 shrink-0 place-items-center rounded-full border bg-background">
                      {isBusy ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : done ? (
                        <Check className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center">
                <ListPlus className="mx-auto size-6 text-muted-foreground" />

                <p className="mt-3 font-semibold">No lists yet</p>

                <p className="mt-1 text-sm text-muted-foreground">Create one without leaving this product.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={mutating}
            onClick={() => {
              setCreating(true);
            }}
            className="
              mt-4 inline-flex
              h-11 w-full
              items-center justify-center
              gap-2 rounded-xl
              border text-sm font-semibold
              transition-colors
              hover:bg-muted
              disabled:cursor-not-allowed
              disabled:opacity-60
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            ">
            <ListPlus className="size-4" />
            Create a new list
          </button>
        </section>
      </div>

      <ShoppingListFormDialog
        open={creating}
        busy={mutating}
        onClose={() => {
          setCreating(false);
        }}
        onSubmit={async input => {
          const response = await createList(input);

          setCreating(false);

          const created = response.affectedList;

          if (created) {
            await addToList(created.id);
          }
        }}
      />
    </>
  );

  return createPortal(dialog, document.body);
}
