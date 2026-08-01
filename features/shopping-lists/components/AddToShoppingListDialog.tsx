'use client';

import {
  Check,
  ListPlus,
  LoaderCircle,
  Plus
} from 'lucide-react';

import {
  useMemo,
  useState
} from 'react';

import {
  useSearchParams
} from 'next/navigation';

import {
  GlobalDialog
} from '@/features/global-overlay';

import type {
  ProductType,
  ProductVariantType
} from '@/types/types';

import {
  useOptionalShoppingLists
} from '../client/ShoppingListProvider';

import {
  ShoppingListFormDialog
} from './ShoppingListFormDialog';

type Props = {
  open:
    boolean;

  product:
    ProductType;

  variant?:
    ProductVariantType |
    null;

  onClose:
    () => void;
};

export function AddToShoppingListDialog({
  open,
  product,
  variant,
  onClose
}: Props) {
  const searchParams =
    useSearchParams();

  const context =
    useOptionalShoppingLists();

  const [
    selectedId,
    setSelectedId
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    creating,
    setCreating
  ] =
    useState(
      false
    );

  const [
    success,
    setSuccess
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const [
    error,
    setError
  ] =
    useState<
      string |
      null
    >(
      null
    );

  const preferredListId =
    searchParams.get(
      'shoppingList'
    );

  const selectedVariant =
    useMemo(
      () =>
        variant ??
        product.variants.find(
          item =>
            item.stockLeft >
            0
        ) ??
        product.variants[0] ??
        null,
      [
        product.variants,
        variant
      ]
    );

  if (!context) {
    return null;
  }

  const {
    lists,
    mutating,
    createList,
    addItem
  } =
    context;

  const orderedLists =
    preferredListId
      ? [
          ...lists
        ].sort(
          (
            first,
            second
          ) => {
            if (
              first.id ===
              preferredListId
            ) {
              return -1;
            }

            if (
              second.id ===
              preferredListId
            ) {
              return 1;
            }

            return (
              first.position -
              second.position
            );
          }
        )
      : lists;

  async function addToList(
    listId:
      string
  ): Promise<void> {
    if (
      mutating ||
      !selectedVariant
    ) {
      return;
    }

    setSelectedId(
      listId
    );

    setSuccess(
      null
    );

    setError(
      null
    );

    try {
      await addItem(
        listId,
        {
          productId:
            product.id,

          variantId:
            selectedVariant.id,

          quantity:
            1
        }
      );

      setSuccess(
        listId
      );

      window.setTimeout(
        () => {
          onClose();
        },
        650
      );
    } catch (
      addError
    ) {
      setError(
        addError instanceof
        Error
          ? addError.message
          : 'Unable to add this product to the shopping list.'
      );
    } finally {
      setSelectedId(
        null
      );
    }
  }

  return (
    <>
      <GlobalDialog
        id="add-to-shopping-list"
        open={
          open
        }
        onOpenChange={
          nextOpen => {
            if (
              !nextOpen &&
              !creating
            ) {
              onClose();
            }
          }
        }
        eyebrow="Save with purpose"
        title="Add to Shopping List"
        description={
          product.name
        }
        size="compact"
        presentation="adaptive"
        padding="compact"
        scrollMode="body"
        dismissible={
          !mutating &&
          !creating
        }
        footer={
          <button
            type="button"
            disabled={
              mutating
            }
            onClick={() =>
              setCreating(
                true
              )
            }
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border text-xs font-bold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ListPlus className="size-4" />

            Create a new list
          </button>
        }>
        {error ? (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {
              error
            }
          </div>
        ) : null}

        <div className="space-y-2">
          {lists.length >
          0 ? (
            orderedLists.map(
              list => {
                const busy =
                  mutating &&
                  selectedId ===
                    list.id;

                const done =
                  success ===
                  list.id;

                return (
                  <button
                    key={
                      list.id
                    }
                    type="button"
                    disabled={
                      mutating
                    }
                    onClick={() =>
                      void addToList(
                        list.id
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/45 p-3 text-left transition hover:border-foreground/20 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="min-w-0">
                      <span className="block truncate font-bold">
                        {
                          list.name
                        }
                      </span>

                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {list.id ===
                        preferredListId
                          ? 'Selected plan · '
                          : ''}

                        {
                          list.itemCount
                        }{' '}

                        {list.itemCount ===
                        1
                          ? 'product'
                          : 'products'}
                      </span>
                    </span>

                    <span className="grid size-8 shrink-0 place-items-center rounded-full border bg-background">
                      {busy ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : done ? (
                        <Check className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </span>
                  </button>
                );
              }
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-center">
              <ListPlus className="mx-auto size-6 text-muted-foreground" />

              <p className="mt-3 font-bold">
                No lists yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Create one without
                leaving this product.
              </p>
            </div>
          )}
        </div>
      </GlobalDialog>

      <ShoppingListFormDialog
        open={
          creating
        }
        busy={
          mutating
        }
        onClose={() =>
          setCreating(
            false
          )
        }
        onSubmit={
          async input => {
            const response =
              await createList(
                input
              );

            setCreating(
              false
            );

            const created =
              response.affectedList;

            if (created) {
              await addToList(
                created.id
              );
            }
          }
        }
      />
    </>
  );
}
