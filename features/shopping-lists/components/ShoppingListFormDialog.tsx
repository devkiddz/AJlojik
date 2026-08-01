'use client';

import {
  LoaderCircle
} from 'lucide-react';

import {
  useId,
  useState,
  type FormEvent
} from 'react';

import {
  GlobalDialog
} from '@/features/global-overlay';

import {
  cn
} from '@/lib/utils';

import type {
  ShoppingList
} from '../shoppingListTypes';

type Props = {
  open:
    boolean;

  list?:
    ShoppingList |
    null;

  busy?:
    boolean;

  onClose:
    () => void;

  onSubmit: (
    input: {
      name:
        string;

      description?:
        string;
    }
  ) => Promise<void>;
};

export function ShoppingListFormDialog({
  open,
  list,
  busy = false,
  onClose,
  onSubmit
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <ShoppingListFormCanvas
      key={
        list?.id ??
        'new-shopping-list'
      }
      list={
        list
      }
      busy={
        busy
      }
      onClose={
        onClose
      }
      onSubmit={
        onSubmit
      }
    />
  );
}

function ShoppingListFormCanvas({
  list,
  busy,
  onClose,
  onSubmit
}: Omit<
  Props,
  'open'
>) {
  const generatedId =
    useId();

  const formId =
    `shopping-list-form-${generatedId.replaceAll(
      ':',
      ''
    )}`;

  const [
    name,
    setName
  ] =
    useState(
      list?.name ??
      ''
    );

  const [
    description,
    setDescription
  ] =
    useState(
      list?.description ??
      ''
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

  async function submit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName =
      name.trim();

    if (
      cleanName.length <
      2
    ) {
      setError(
        'Give this list a clear name.'
      );

      return;
    }

    try {
      setError(
        null
      );

      await onSubmit({
        name:
          cleanName,

        description:
          description.trim() ||
          undefined
      });
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Unable to save this list.'
      );
    }
  }

  return (
    <GlobalDialog
      id={
        list
          ? `shopping-list-edit-${list.id}`
          : 'shopping-list-create'
      }
      open
      onOpenChange={
        nextOpen => {
          if (!nextOpen) {
            onClose();
          }
        }
      }
      eyebrow="Shopping List"
      title={
        list
          ? 'Refine your list'
          : 'Create a new plan'
      }
      description={
        list
          ? 'Update the name and purpose without changing the products already inside.'
          : 'Create a reusable customer-owned plan for products, quantities and preparation.'
      }
      size="compact"
      presentation="adaptive"
      padding="comfortable"
      scrollMode="body"
      dismissible={
        !busy
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              busy
            }
            className="h-10 rounded-xl border px-4 text-xs font-bold transition hover:bg-muted disabled:opacity-50">
            Cancel
          </button>

          <button
            type="submit"
            form={
              formId
            }
            disabled={
              busy
            }
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl',
              'bg-foreground px-5 text-xs font-bold text-background',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}>
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : null}

            {list
              ? 'Save changes'
              : 'Create list'}
          </button>
        </div>
      }>
      <form
        id={
          formId
        }
        className="space-y-4"
        onSubmit={
          submit
        }>
        <label className="block">
          <span className="text-xs font-bold">
            List name
          </span>

          <input
            autoFocus
            value={
              name
            }
            onChange={
              event =>
                setName(
                  event.target
                    .value
                )
            }
            maxLength={
              80
            }
            placeholder="Weekend restock"
            className="mt-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold">
            Description{' '}

            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </span>

          <textarea
            value={
              description
            }
            onChange={
              event =>
                setDescription(
                  event.target
                    .value
                )
            }
            maxLength={
              240
            }
            rows={
              4
            }
            placeholder="What is this list helping you prepare for?"
            className="mt-2 w-full resize-none rounded-xl border bg-background px-3 py-3 text-sm leading-5 outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {
              error
            }
          </p>
        ) : null}
      </form>
    </GlobalDialog>
  );
}
