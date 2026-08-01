'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  UserRound,
  XCircle
} from 'lucide-react';

import type {
  PreparationItemStatus,
  PreparationItemView,
  PreparationVariantReference,
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

function label(
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

function statusClass(
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

export function PreparationOperationsClient({
  workspaceName
}: {
  workspaceName: string;
}) {
  const [
    requests,
    setRequests
  ] =
    useState<
      PreparationView[]
    >([]);

  const [
    selectedId,
    setSelectedId
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    filter,
    setFilter
  ] =
    useState<
      | 'ACTIVE'
      | 'AWAITING'
      | 'READY'
      | 'ALL'
    >(
      'ACTIVE'
    );

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
    operationNote,
    setOperationNote
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
              '/api/admin/shopping-list-preparations',
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

          setSelectedId(
            current =>
              current &&
              data.requests.some(
                request =>
                  request.id ===
                  current
              )
                ? current
                : data.requests[0]
                    ?.id ??
                  null
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
              : 'Unable to load preparation operations.'
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {
      void load();
    },
    [
      load
    ]
  );

  const visibleRequests =
    useMemo(
      () =>
        requests.filter(
          request => {
            if (
              filter ===
              'ALL'
            ) {
              return true;
            }

            if (
              filter ===
              'AWAITING'
            ) {
              return (
                request.status ===
                'AWAITING_CUSTOMER_APPROVAL'
              );
            }

            if (
              filter ===
              'READY'
            ) {
              return (
                request.status ===
                  'READY_FOR_CHECKOUT' ||
                request.status ===
                  'ORDER_CREATED'
              );
            }

            return ![
              'COMPLETED',
              'CANCELLED'
            ].includes(
              request.status
            );
          }
        ),
      [
        filter,
        requests
      ]
    );

  const selected =
    useMemo(
      () =>
        requests.find(
          request =>
            request.id ===
            selectedId
        ) ??
        visibleRequests[0] ??
        null,
      [
        requests,
        selectedId,
        visibleRequests
      ]
    );

  function replaceRequest(
    preparation:
      PreparationView
  ) {
    setRequests(
      current =>
        current.map(
          item =>
            item.id ===
            preparation.id
              ? preparation
              : item
        )
    );

    setSelectedId(
      preparation.id
    );
  }

  async function transition(
    nextStatus:
      | 'IN_PREPARATION'
      | 'AWAITING_CUSTOMER_APPROVAL'
      | 'READY_FOR_CHECKOUT'
      | 'COMPLETED'
      | 'CANCELLED'
  ) {
    if (!selected) {
      return;
    }

    setMutating(
      true
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          `/api/admin/shopping-list-preparations/${encodeURIComponent(
            selected.id
          )}/transition`,
          {
            method:
              'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify({
                nextStatus,
                note:
                  operationNote
              })
          }
        );

      const data =
        await readJson<{
          preparation:
            PreparationView;
        }>(
          response
        );

      replaceRequest(
        data.preparation
      );

      setOperationNote(
        ''
      );
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Unable to change preparation status.'
      );
    } finally {
      setMutating(
        false
      );
    }
  }

  async function saveItem(
    itemId: string,
    payload: {
      status:
        PreparationItemStatus;
      resolvedVariantId?:
        string | null;
      preparedQuantity:
        number;
      quotedUnitPrice:
        number;
      substitutionReason:
        string;
      staffNote:
        string;
    }
  ) {
    if (!selected) {
      return;
    }

    setMutating(
      true
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          `/api/admin/shopping-list-preparations/${encodeURIComponent(
            selected.id
          )}/items/${encodeURIComponent(
            itemId
          )}`,
          {
            method:
              'PATCH',
            headers: {
              'Content-Type':
                'application/json'
            },
            body:
              JSON.stringify(
                payload
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

      replaceRequest(
        data.preparation
      );
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'Unable to save the item resolution.'
      );

    } finally {
      setMutating(
        false
      );
    }
  }

  return (
    <main className="admin-page min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.1),transparent_34%)] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-card/85 p-5 shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
                {workspaceName} · Live operations
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Preparation control
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Verify Shopping List items, resolve substitutions and prices,
                then issue a customer-approved checkout quote.
              </p>
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
              className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-black disabled:opacity-50">
              <RefreshCw
                className={
                  loading
                    ? 'size-4 animate-spin'
                    : 'size-4'
                }
              />
              Refresh queue
            </button>
          </div>
        </header>

        {error ? (
          <div className="flex gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-700 dark:text-rose-300">
            <CircleAlert className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <section className="grid min-h-[42rem] gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  'ACTIVE',
                  'AWAITING',
                  'READY',
                  'ALL'
                ] as const
              ).map(
                item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(
                        item
                      )
                    }
                    className={
                      filter ===
                      item
                        ? 'rounded-full bg-foreground px-3 py-2 text-[9px] font-black text-background'
                        : 'rounded-full border px-3 py-2 text-[9px] font-black text-muted-foreground'
                    }>
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="grid min-h-48 place-items-center">
                  <LoaderCircle className="size-6 animate-spin text-primary" />
                </div>
              ) : visibleRequests.length ? (
                visibleRequests.map(
                  request => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          request.id
                        )
                      }
                      className={
                        selected?.id ===
                        request.id
                          ? 'w-full rounded-2xl border border-primary/30 bg-primary/8 p-4 text-left ring-2 ring-primary/10'
                          : 'w-full rounded-2xl border border-border/50 bg-background/55 p-4 text-left transition hover:border-primary/20 hover:bg-muted/50'
                      }>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black">
                            {
                              request.shoppingListName
                            }
                          </p>

                          <p className="mt-1 truncate text-[9px] text-muted-foreground">
                            {
                              request.customerName
                            }
                          </p>
                        </div>

                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </div>

                      <span
                        className={`mt-3 inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase ${statusClass(
                          request.status
                        )}`}>
                        {label(
                          request.status
                        )}
                      </span>

                      <div className="mt-3 flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>
                          {
                            request.items
                              .length
                          }{' '}
                          items
                        </span>

                        <span className="font-black text-foreground">
                          {currency.format(
                            request.approvedTotal ??
                              request.quotedSubtotal
                          )}
                        </span>
                      </div>
                    </button>
                  )
                )
              ) : (
                <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed p-5 text-center text-xs text-muted-foreground">
                  No preparation requests match this view.
                </div>
              )}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-lg sm:p-6">
            {selected ? (
              <div>
                <div className="flex flex-col gap-5 border-b border-border/60 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${statusClass(
                        selected.status
                      )}`}>
                      {label(
                        selected.status
                      )}
                    </span>

                    <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                      {
                        selected.shoppingListName
                      }
                    </h2>

                    <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <UserRound className="size-3.5" />
                      {
                        selected.customerName
                      }{' '}
                      ·{' '}
                      {
                        selected.customerEmail
                      }
                    </p>

                    {selected.customerNote ? (
                      <p className="mt-3 max-w-2xl rounded-xl bg-muted/60 px-3 py-2 text-xs leading-5">
                        {
                          selected.customerNote
                        }
                      </p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Metric
                      label="Original"
                      value={
                        selected.originalEstimatedTotal
                      }
                    />
                    <Metric
                      label={`Quote v${selected.quoteVersion}`}
                      value={
                        selected.approvedTotal ??
                        selected.quotedSubtotal
                      }
                      primary
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {selected.items.map(
                    item => (
                      <PreparationItemEditor
                        key={`${item.id}:${item.updatedAt}`}
                        item={
                          item
                        }
                        disabled={
                          mutating ||
                          ![
                            'SUBMITTED',
                            'IN_PREPARATION',
                            'AWAITING_CUSTOMER_APPROVAL'
                          ].includes(
                            selected.status
                          )
                        }
                        onSave={
                          payload =>
                            saveItem(
                              item.id,
                              payload
                            )
                        }
                      />
                    )
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-border/60 bg-background/55 p-4">
                  <label>
                    <span className="text-xs font-black">
                      Operation note
                    </span>

                    <textarea
                      value={
                        operationNote
                      }
                      onChange={
                        event =>
                          setOperationNote(
                            event.target
                              .value
                          )
                      }
                      rows={2}
                      placeholder="Optional note for the customer and audit history"
                      className="mt-2 w-full resize-none rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50"
                    />
                  </label>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.status ===
                    'SUBMITTED' ? (
                      <ActionButton
                        icon={
                          <ClipboardCheck />
                        }
                        label="Start preparation"
                        onClick={() =>
                          void transition(
                            'IN_PREPARATION'
                          )
                        }
                        disabled={
                          mutating
                        }
                      />
                    ) : null}

                    {selected.status ===
                      'IN_PREPARATION' ? (
                      <>
                        <ActionButton
                          icon={
                            <Send />
                          }
                          label="Request customer approval"
                          onClick={() =>
                            void transition(
                              'AWAITING_CUSTOMER_APPROVAL'
                            )
                          }
                          disabled={
                            mutating
                          }
                        />

                        <ActionButton
                          icon={
                            <PackageCheck />
                          }
                          label="Ready without changes"
                          onClick={() =>
                            void transition(
                              'READY_FOR_CHECKOUT'
                            )
                          }
                          disabled={
                            mutating
                          }
                          secondary
                        />
                      </>
                    ) : null}

                    {selected.status ===
                    'AWAITING_CUSTOMER_APPROVAL' ? (
                      <ActionButton
                        icon={
                          <ShieldAlert />
                        }
                        label="Reopen preparation"
                        onClick={() =>
                          void transition(
                            'IN_PREPARATION'
                          )
                        }
                        disabled={
                          mutating
                        }
                        secondary
                      />
                    ) : null}

                    {selected.status ===
                    'ORDER_CREATED' ? (
                      <ActionButton
                        icon={
                          <CheckCircle2 />
                        }
                        label="Mark preparation completed"
                        onClick={() =>
                          void transition(
                            'COMPLETED'
                          )
                        }
                        disabled={
                          mutating
                        }
                      />
                    ) : null}

                    {[
                      'SUBMITTED',
                      'IN_PREPARATION',
                      'AWAITING_CUSTOMER_APPROVAL',
                      'READY_FOR_CHECKOUT'
                    ].includes(
                      selected.status
                    ) ? (
                      <button
                        type="button"
                        disabled={
                          mutating
                        }
                        onClick={() =>
                          void transition(
                            'CANCELLED'
                          )
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[10px] font-black text-rose-600 disabled:opacity-50">
                        <XCircle className="size-4" />
                        Cancel request
                      </button>
                    ) : null}
                  </div>
                </div>

                {selected.events.length ? (
                  <div className="mt-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                      Preparation history
                    </p>

                    <div className="mt-3 space-y-2">
                      {selected.events
                        .slice(
                          0,
                          8
                        )
                        .map(
                          event => (
                            <div
                              key={
                                event.id
                              }
                              className="flex gap-3 rounded-xl border border-border/50 bg-background/45 p-3">
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />

                              <div className="min-w-0">
                                <p className="text-[10px] font-black">
                                  {label(
                                    event.type
                                  )}
                                </p>

                                <p className="mt-1 text-[9px] text-muted-foreground">
                                  {
                                    event.actorName ??
                                    'System'
                                  }{' '}
                                  ·{' '}
                                  {new Date(
                                    event.createdAt
                                  ).toLocaleString(
                                    'en-NG'
                                  )}
                                </p>

                                {event.note ? (
                                  <p className="mt-1 text-[10px] leading-4">
                                    {
                                      event.note
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid min-h-[36rem] place-items-center text-center">
                <div>
                  <ClipboardCheck className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-black">
                    Select a preparation request
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The operational details will appear here.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label: metricLabel,
  value,
  primary = false
}: {
  label: string;
  value: number;
  primary?: boolean;
}) {
  return (
    <div
      className={
        primary
          ? 'rounded-2xl bg-primary/10 px-4 py-3 text-right text-primary'
          : 'rounded-2xl bg-muted/60 px-4 py-3 text-right'
      }>
      <p className="text-[9px]">
        {metricLabel}
      </p>
      <p className="mt-1 text-sm font-black">
        {currency.format(
          value
        )}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  label: actionLabel,
  onClick,
  disabled,
  secondary = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className={
        secondary
          ? 'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[10px] font-black disabled:opacity-50 [&_svg]:size-4'
          : 'inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-black text-background disabled:opacity-50 [&_svg]:size-4'
      }>
      {icon}
      {actionLabel}
    </button>
  );
}

function PreparationItemEditor({
  item,
  disabled,
  onSave
}: {
  item:
    PreparationItemView;
  disabled:
    boolean;
  onSave: (
    payload: {
      status:
        PreparationItemStatus;
      resolvedVariantId?:
        string | null;
      preparedQuantity:
        number;
      quotedUnitPrice:
        number;
      substitutionReason:
        string;
      staffNote:
        string;
    }
  ) => Promise<unknown>;
}) {
  const [
    status,
    setStatus
  ] =
    useState<
      PreparationItemStatus
    >(
      item.status ===
      'PENDING'
        ? 'AVAILABLE'
        : item.status
    );

  const [
    quantity,
    setQuantity
  ] =
    useState(
      item.preparedQuantity
    );

  const [
    price,
    setPrice
  ] =
    useState(
      item.quotedUnitPrice
    );

  const [
    reason,
    setReason
  ] =
    useState(
      item.substitutionReason ??
      ''
    );

  const [
    note,
    setNote
  ] =
    useState(
      item.staffNote ??
      ''
    );

  const [
    selectedVariant,
    setSelectedVariant
  ] =
    useState<
      PreparationVariantReference | null
    >(
      item.resolvedVariant
    );

  const [
    search,
    setSearch
  ] =
    useState(
      ''
    );

  const [
    results,
    setResults
  ] =
    useState<
      PreparationVariantReference[]
    >([]);

  const [
    searching,
    setSearching
  ] =
    useState(
      false
    );

  const [
    saving,
    setSaving
  ] =
    useState(
      false
    );

  useEffect(
    () => {
      if (
        status !==
          'SUBSTITUTED' ||
        search.trim().length <
          2
      ) {
        setResults(
          []
        );

        return;
      }

      const controller =
        new AbortController();

      const timer =
        window.setTimeout(
          () => {
            setSearching(
              true
            );

            void fetch(
              `/api/admin/shopping-list-preparations/variants?q=${encodeURIComponent(
                search
              )}`,
              {
                cache:
                  'no-store',
                signal:
                  controller.signal
              }
            )
              .then(
                response =>
                  readJson<{
                    variants:
                      PreparationVariantReference[];
                  }>(
                    response
                  )
              )
              .then(
                data =>
                  setResults(
                    data.variants
                  )
              )
              .catch(
                () =>
                  setResults(
                    []
                  )
              )
              .finally(
                () =>
                  setSearching(
                    false
                  )
              );
          },
          300
        );

      return () => {
        window.clearTimeout(
          timer
        );

        controller.abort();
      };
    },
    [
      search,
      status
    ]
  );

  const excluded =
    status ===
      'UNAVAILABLE' ||
    status ===
      'REMOVED';

  async function save() {
    setSaving(
      true
    );

    try {
      await onSave({
        status,
        ...(status ===
        'SUBSTITUTED'
          ? {
              resolvedVariantId:
                selectedVariant
                  ?.id ??
                null
            }
          : {}),
        preparedQuantity:
          excluded
            ? 0
            : Math.max(
                1,
                quantity
              ),
        quotedUnitPrice:
          excluded
            ? 0
            : Math.max(
                0,
                price
              ),
        substitutionReason:
          reason,
        staffNote:
          note
      });
    } finally {
      setSaving(
        false
      );
    }
  }

  return (
    <article className="rounded-2xl border border-border/60 bg-background/50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black">
            {
              item.originalProduct
                .name
            }
          </p>

          <p className="mt-1 text-[10px] text-muted-foreground">
            Requested:{' '}
            {
              item.originalVariantLabel ??
              'No variant'
            }{' '}
            · {item.requestedQuantity} ×{' '}
            {currency.format(
              item.originalUnitPrice
            )}
          </p>

          {item.customerDecision !==
          'NOT_REQUIRED' ? (
            <span className="mt-2 inline-flex rounded-full bg-amber-500/10 px-2 py-1 text-[8px] font-black uppercase text-amber-700 dark:text-amber-300">
              Customer:{' '}
              {label(
                item.customerDecision
              )}
            </span>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:w-[34rem]">
          <label>
            <span className="text-[9px] font-black uppercase text-muted-foreground">
              Resolution
            </span>

            <select
              value={
                status
              }
              disabled={
                disabled
              }
              onChange={
                event =>
                  setStatus(
                    event.target
                      .value as PreparationItemStatus
                  )
              }
              className="mt-1 h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none">
              <option value="AVAILABLE">
                Available
              </option>
              <option value="PARTIALLY_AVAILABLE">
                Partially available
              </option>
              <option value="SUBSTITUTED">
                Substituted
              </option>
              <option value="PRICE_CHANGED">
                Price changed
              </option>
              <option value="PREPARED">
                Prepared
              </option>
              <option value="UNAVAILABLE">
                Unavailable
              </option>
              <option value="REMOVED">
                Removed
              </option>
            </select>
          </label>

          <label>
            <span className="text-[9px] font-black uppercase text-muted-foreground">
              Quantity
            </span>

            <input
              type="number"
              min={0}
              value={
                excluded
                  ? 0
                  : quantity
              }
              disabled={
                disabled ||
                excluded
              }
              onChange={
                event =>
                  setQuantity(
                    Number(
                      event.target
                        .value
                    )
                  )
              }
              className="mt-1 h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
            />
          </label>

          <label>
            <span className="text-[9px] font-black uppercase text-muted-foreground">
              Unit price
            </span>

            <input
              type="number"
              min={0}
              value={
                excluded
                  ? 0
                  : price
              }
              disabled={
                disabled ||
                excluded
              }
              onChange={
                event =>
                  setPrice(
                    Number(
                      event.target
                        .value
                    )
                  )
              }
              className="mt-1 h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
            />
          </label>
        </div>
      </div>

      {status ===
      'SUBSTITUTED' ? (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <label className="relative block">
            <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-300">
              Replacement product or variant
            </span>

            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                value={
                  search
                }
                disabled={
                  disabled
                }
                onChange={
                  event =>
                    setSearch(
                      event.target
                        .value
                    )
                }
                placeholder="Search products or variants"
                className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-xs outline-none"
              />
            </div>
          </label>

          {selectedVariant ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-background p-3">
              <div>
                <p className="text-xs font-black">
                  {
                    selectedVariant.productName
                  }
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  {
                    selectedVariant.label
                  }{' '}
                  ·{' '}
                  {currency.format(
                    selectedVariant.price
                  )}{' '}
                  · Available{' '}
                  {selectedVariant.availableQuantity ??
                    'Untracked'}
                </p>
              </div>

              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            </div>
          ) : null}

          {searching ? (
            <p className="mt-2 flex items-center gap-2 text-[9px] text-muted-foreground">
              <LoaderCircle className="size-3 animate-spin" />
              Searching catalog…
            </p>
          ) : null}

          {results.length ? (
            <div className="mt-2 grid max-h-48 gap-2 overflow-y-auto">
              {results.map(
                variant => (
                  <button
                    key={
                      variant.id
                    }
                    type="button"
                    onClick={() => {
                      setSelectedVariant(
                        variant
                      );

                      setPrice(
                        variant.price
                      );

                      setResults(
                        []
                      );
                    }}
                    className="rounded-xl border bg-background p-3 text-left hover:border-primary/30">
                    <p className="text-xs font-black">
                      {
                        variant.productName
                      }
                    </p>

                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {
                        variant.label
                      }{' '}
                      ·{' '}
                      {currency.format(
                        variant.price
                      )}{' '}
                      · Available{' '}
                      {variant.availableQuantity ??
                        'Untracked'}
                    </p>
                  </button>
                )
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-[9px] font-black uppercase text-muted-foreground">
            Customer-facing reason
          </span>

          <input
            value={
              reason
            }
            disabled={
              disabled
            }
            onChange={
              event =>
                setReason(
                  event.target
                    .value
                )
            }
            placeholder="Why did the item, quantity or price change?"
            className="mt-1 h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
          />
        </label>

        <label>
          <span className="text-[9px] font-black uppercase text-muted-foreground">
            Internal preparation note
          </span>

          <input
            value={
              note
            }
            disabled={
              disabled
            }
            onChange={
              event =>
                setNote(
                  event.target
                    .value
                )
            }
            placeholder="Shelf, stock or packing note"
            className="mt-1 h-10 w-full rounded-xl border bg-background px-3 text-xs outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
        <p className="text-[10px] text-muted-foreground">
          Prepared line:{' '}
          <strong className="text-foreground">
            {currency.format(
              excluded
                ? 0
                : Math.max(
                    0,
                    price
                  ) *
                  Math.max(
                    1,
                    quantity
                  )
            )}
          </strong>
        </p>

        <button
          type="button"
          disabled={
            disabled ||
            saving
          }
          onClick={() =>
            void save()
          }
          className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-black text-background disabled:opacity-50">
          {saving ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          Save resolution
        </button>
      </div>
    </article>
  );
}
