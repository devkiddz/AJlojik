'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import Link from 'next/link';

import {
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  X
} from 'lucide-react';

import type {
  PreparationView
} from './preparationContracts';

const currency =
  new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',
      currency:
        'NGN',
      maximumFractionDigits:
        0
    }
  );

async function readJson<T>(
  response: Response
): Promise<T> {
  const payload =
    (await response.json()) as
      T & {
        error?: string;
      };

  if (!response.ok) {
    throw new Error(
      payload.error ??
      'The request could not be completed.'
    );
  }

  return payload;
}

function statusLabel(
  value: string
) {
  return value
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /^\w/,
      character =>
        character.toUpperCase()
    );
}

function statusTone(
  status: PreparationView['status']
) {
  if (
    status ===
      'READY_FOR_CHECKOUT' ||
    status ===
      'ORDER_CREATED' ||
    status ===
      'COMPLETED'
  ) {
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  }

  if (
    status ===
      'AWAITING_CUSTOMER_APPROVAL'
  ) {
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }

  if (
    status ===
    'CANCELLED'
  ) {
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-300';
  }

  return 'bg-primary/10 text-primary';
}

export function ShoppingListPreparationPanel({
  list
}: {
  list: {
    id: string;
    workspaceId: string;
    name: string;
    itemCount: number;
  };
}) {
  const [
    requests,
    setRequests
  ] =
    useState<
      PreparationView[]
    >([]);

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    mutating,
    setMutating
  ] =
    useState(
      false
    );

  const [
    error,
    setError
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    note,
    setNote
  ] =
    useState(
      ''
    );

  const load =
    useCallback(
      async () => {
        setLoading(
          true
        );

        try {
          const response =
            await fetch(
              `/api/shopping-list-preparations?workspaceId=${encodeURIComponent(
                list.workspaceId
              )}&shoppingListId=${encodeURIComponent(
                list.id
              )}`,
              {
                cache:
                  'no-store'
              }
            );

          const data =
            await readJson<{
              requests:
                PreparationView[];
            }>(
              response
            );

          setRequests(
            data.requests
          );

          setError(
            null
          );
        } catch (
          cause
        ) {
          setError(
            cause instanceof
            Error
              ? cause.message
              : 'Unable to load preparation activity.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        list.id,
        list.workspaceId
      ]
    );

  useEffect(
    () => {
      void load();

      const onFocus =
        () => {
          void load();
        };

      window.addEventListener(
        'focus',
        onFocus
      );

      return () => {
        window.removeEventListener(
          'focus',
          onFocus
        );
      };
    },
    [
      load
    ]
  );

  const active =
    useMemo(
      () =>
        requests.find(
          request =>
            request.status !==
              'COMPLETED' &&
            request.status !==
              'CANCELLED'
        ) ??
        null,
      [
        requests
      ]
    );

  async function mutate(
    path: string,
    body: Record<
      string,
      unknown
    >
  ) {
    setMutating(
      true
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          path,
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify(
                body
              )
          }
        );

      const data =
        await readJson<{
          preparation:
            PreparationView;
        }>(
          response
        );

      setRequests(
        current => [
          data.preparation,
          ...current.filter(
            request =>
              request.id !==
              data.preparation
                .id
          )
        ]
      );

      setNote(
        ''
      );

      return data.preparation;
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Unable to update preparation.'
      );

      return null;
    } finally {
      setMutating(
        false
      );
    }
  }

  async function submit() {
    await mutate(
      '/api/shopping-list-preparations',
      {
        workspaceId:
          list.workspaceId,
        shoppingListId:
          list.id,
        customerNote:
          note
      }
    );
  }

  async function decideItem(
    requestId: string,
    itemId: string,
    decision:
      | 'APPROVED'
      | 'REJECTED'
  ) {
    await mutate(
      `/api/shopping-list-preparations/${encodeURIComponent(
        requestId
      )}/items/${encodeURIComponent(
        itemId
      )}/decision`,
      {
        decision
      }
    );
  }

  async function decideRequest(
    requestId: string,
    decision:
      | 'APPROVED'
      | 'CHANGES_REQUESTED'
      | 'CANCELLED'
  ) {
    await mutate(
      `/api/shopping-list-preparations/${encodeURIComponent(
        requestId
      )}/decision`,
      {
        decision,
        note
      }
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.12),transparent_32%),hsl(var(--card))] shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <ClipboardCheck className="size-5" />
          </span>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/70">
              Operational fulfilment
            </p>

            <h2 className="mt-1 text-xl font-black">
              Shopping List preparation
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
              Submit this list for staff verification, live availability checks,
              substitutions and a final checkout-ready quote.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          disabled={
            loading ||
            mutating
          }
          className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[10px] font-bold disabled:opacity-50">
          <RefreshCw
            className={
              loading
                ? 'size-3.5 animate-spin'
                : 'size-3.5'
            }
          />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mx-5 mt-5 flex gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-700 dark:text-rose-300 sm:mx-6">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid min-h-48 place-items-center p-6">
          <LoaderCircle className="size-6 animate-spin text-primary" />
        </div>
      ) : active ? (
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${statusTone(
                  active.status
                )}`}>
                {statusLabel(
                  active.status
                )}
              </span>

              <p className="mt-3 text-sm font-black">
                Quote version {active.quoteVersion}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Submitted{' '}
                {new Date(
                  active.submittedAt
                ).toLocaleString(
                  'en-NG'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-[9px] text-muted-foreground">
                  Original estimate
                </p>
                <p className="mt-1 text-sm font-black">
                  {currency.format(
                    active.originalEstimatedTotal
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-primary/10 px-3 py-2">
                <p className="text-[9px] text-primary/70">
                  Prepared quote
                </p>
                <p className="mt-1 text-sm font-black text-primary">
                  {currency.format(
                    active.approvedTotal ??
                      active.quotedSubtotal
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {active.items.map(
              item => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-black">
                        {item.resolvedProduct
                          ?.name ??
                          item.productName}
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        {item.resolvedVariantLabel ??
                          item.originalVariantLabel ??
                          'Variant unavailable'}{' '}
                        · {item.preparedQuantity} ×{' '}
                        {currency.format(
                          item.quotedUnitPrice
                        )}
                      </p>

                      {item.substitutionReason ? (
                        <p className="mt-2 text-[10px] leading-4 text-amber-700 dark:text-amber-300">
                          {item.substitutionReason}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-1 text-[8px] font-black uppercase">
                        {statusLabel(
                          item.status
                        )}
                      </span>

                      <span className="text-xs font-black">
                        {currency.format(
                          item.quotedLineTotal
                        )}
                      </span>
                    </div>
                  </div>

                  {active.status ===
                    'AWAITING_CUSTOMER_APPROVAL' &&
                  item.customerDecision ===
                    'PENDING' ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                      <button
                        type="button"
                        disabled={
                          mutating
                        }
                        onClick={() =>
                          void decideItem(
                            active.id,
                            item.id,
                            'APPROVED'
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-3 text-[10px] font-black text-white disabled:opacity-50">
                        <Check className="size-3.5" />
                        Accept item
                      </button>

                      <button
                        type="button"
                        disabled={
                          mutating
                        }
                        onClick={() =>
                          void decideItem(
                            active.id,
                            item.id,
                            'REJECTED'
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-500/30 px-3 text-[10px] font-black text-rose-700 disabled:opacity-50 dark:text-rose-300">
                        <X className="size-3.5" />
                        Remove item
                      </button>
                    </div>
                  ) : null}

                  {item.customerDecision ===
                    'APPROVED' ? (
                    <p className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                      <ShieldCheck className="size-3" />
                      Customer approved
                    </p>
                  ) : null}

                  {item.customerDecision ===
                    'REJECTED' ? (
                    <p className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold text-rose-600">
                      <X className="size-3" />
                      Excluded by customer
                    </p>
                  ) : null}
                </article>
              )
            )}
          </div>

          {active.status ===
          'AWAITING_CUSTOMER_APPROVAL' ? (
            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-black">
                Review the final quote
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Decide every changed item first. Accepting the quote locks this
                preparation version for secure checkout.
              </p>

              <textarea
                value={note}
                onChange={
                  event =>
                    setNote(
                      event.target
                        .value
                    )
                }
                rows={2}
                placeholder="Optional response or requested change"
                className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    mutating
                  }
                  onClick={() =>
                    void decideRequest(
                      active.id,
                      'APPROVED'
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-black text-background disabled:opacity-50">
                  <PackageCheck className="size-4" />
                  Approve final quote
                </button>

                <button
                  type="button"
                  disabled={
                    mutating
                  }
                  onClick={() =>
                    void decideRequest(
                      active.id,
                      'CHANGES_REQUESTED'
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-black disabled:opacity-50">
                  <RotateCcw className="size-4" />
                  Request changes
                </button>

                <button
                  type="button"
                  disabled={
                    mutating
                  }
                  onClick={() =>
                    void decideRequest(
                      active.id,
                      'CANCELLED'
                    )
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[10px] font-black text-rose-600 disabled:opacity-50">
                  <X className="size-4" />
                  Cancel request
                </button>
              </div>
            </div>
          ) : null}

          {active.status ===
          'READY_FOR_CHECKOUT' ? (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                  Your prepared quote is locked
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Continue to fulfilment and secure payment.
                </p>
              </div>

              <Link
                href={`/payments/prepared/${encodeURIComponent(
                  active.id
                )}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-xs font-black text-white">
                <ShoppingCart className="size-4" />
                Checkout prepared list
                <ChevronRight className="size-4" />
              </Link>
            </div>
          ) : null}

          {active.status ===
            'ORDER_CREATED' &&
          active.orderNumber ? (
            <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black">
                  {active.orderNumber} created
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Order {statusLabel(
                    active.orderStatus ??
                      'PENDING'
                  )}{' '}
                  · Payment{' '}
                  {statusLabel(
                    active.paymentStatus ??
                      'PENDING'
                  )}
                </p>
              </div>

              <Link
                href="/orders"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-black text-background">
                Open orders
                <ChevronRight className="size-4" />
              </Link>
            </div>
          ) : null}

          <p className="mt-4 text-[10px] leading-4 text-muted-foreground">
            Your Shopping List remains editable, but an active preparation uses
            the item and price snapshot captured when it was submitted.
          </p>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div className="grid gap-4 rounded-2xl border border-dashed border-border/70 bg-background/40 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label>
              <span className="text-xs font-black">
                Preparation note
              </span>

              <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                Add preferences, acceptable substitutions or timing details.
              </span>

              <textarea
                value={note}
                onChange={
                  event =>
                    setNote(
                      event.target
                        .value
                    )
                }
                rows={3}
                placeholder="Example: Call before replacing the wine brand."
                className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50"
              />
            </label>

            <button
              type="button"
              disabled={
                mutating ||
                list.itemCount ===
                  0
              }
              onClick={() =>
                void submit()
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-black text-background disabled:opacity-50">
              {mutating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ClipboardCheck className="size-4" />
              )}
              Submit for preparation
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
