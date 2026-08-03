'use client';

import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
  XCircle
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
  useTransition
} from 'react';

import { cn } from '@/lib/utils';

import {
  SUPPORT_COMMERCE_ACTION_TYPES
} from '../supportOperationsTypes';
import type {
  SupportCommerceActionTypeValue,
  SupportOperationsSnapshot,
  SupportSLAState
} from '../supportOperationsTypes';

type SupportOperationsPanelProps = {
  caseId: string;
  canPrepare: boolean;
  canApprove: boolean;
};

const dateFormatter =
  new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

export function SupportOperationsPanel({
  caseId,
  canPrepare,
  canApprove
}: SupportOperationsPanelProps) {
  const [snapshot, setSnapshot] =
    useState<SupportOperationsSnapshot | null>(
      null
    );
  const [type, setType] =
    useState<SupportCommerceActionTypeValue>(
      'PAYMENT_REVIEW'
    );
  const [reason, setReason] =
    useState('');
  const [amount, setAmount] =
    useState('');
  const [error, setError] =
    useState<string | null>(null);
  const [isPending, startTransition] =
    useTransition();

  const endpoint =
    `/api/admin/support/cases/${encodeURIComponent(
      caseId
    )}/operations`;

  const load = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await fetch(
          endpoint,
          {
            credentials: 'same-origin',
            cache: 'no-store'
          }
        );

        const payload =
          (await response.json()) as
            | SupportOperationsSnapshot
            | { error?: string };

        if (
          !response.ok ||
          !('actions' in payload)
        ) {
          throw new Error(
            'error' in payload &&
            payload.error
              ? payload.error
              : 'Support operations could not be loaded.'
          );
        }

        setSnapshot(payload);
        setError(null);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Support operations could not be loaded.'
        );
      }
    });
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = (
    body: Record<string, unknown>,
    after?: () => void
  ) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          endpoint,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            credentials: 'same-origin',
            cache: 'no-store',
            body: JSON.stringify(body)
          }
        );

        const payload =
          (await response.json()) as
            | SupportOperationsSnapshot
            | { error?: string };

        if (
          !response.ok ||
          !('actions' in payload)
        ) {
          throw new Error(
            'error' in payload &&
            payload.error
              ? payload.error
              : 'The governed action could not be updated.'
          );
        }

        setSnapshot(payload);
        setError(null);
        after?.();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'The governed action could not be updated.'
        );
      }
    });
  };

  return (
    <section className="space-y-4 rounded-[1.5rem] border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-black">
              Governed operations
            </h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Prepare first. Review separately.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={isPending}
          aria-label="Refresh Support operations"
          className="grid size-8 place-items-center rounded-full border border-border">
          <RefreshCw
            className={cn(
              'size-3.5',
              isPending && 'animate-spin'
            )}
          />
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-[11px] leading-5 text-destructive">
          {error}
        </div>
      ) : null}

      {!snapshot ? (
        <div className="grid min-h-28 place-items-center text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <SLAChip
              label="First response"
              state={
                snapshot.sla
                  .firstResponseState
              }
            />
            <SLAChip
              label="Resolution"
              state={
                snapshot.sla.resolutionState
              }
            />
          </div>

          <div className="space-y-2 rounded-2xl bg-muted/45 p-3">
            {snapshot.commerce.order ? (
              <ContextRow
                icon={PackageCheck}
                label={`Order ${snapshot.commerce.order.orderNumber}`}
                value={`${snapshot.commerce.order.status} · ${snapshot.commerce.order.paymentStatus}`}
              />
            ) : null}

            {snapshot.commerce.delivery ? (
              <ContextRow
                icon={Truck}
                label={
                  snapshot.commerce.delivery
                    .trackingCode
                }
                value={
                  snapshot.commerce.delivery
                    .status
                }
              />
            ) : null}

            {snapshot.commerce.order ? (
              <ContextRow
                icon={Banknote}
                label="Order total"
                value={new Intl.NumberFormat(
                  'en-NG',
                  {
                    style: 'currency',
                    currency:
                      snapshot.commerce.order
                        .currency
                  }
                ).format(
                  snapshot.commerce.order
                    .total
                )}
              />
            ) : null}

            {!snapshot.commerce.order &&
            !snapshot.commerce.delivery &&
            !snapshot.commerce.vendor ? (
              <p className="text-[11px] leading-5 text-muted-foreground">
                No commerce object is linked to
                this case.
              </p>
            ) : null}
          </div>

          {canPrepare ? (
            <div className="space-y-2 border-t border-border/60 pt-4">
              <select
                value={type}
                onChange={event =>
                  setType(
                    event.target.value as
                      SupportCommerceActionTypeValue
                  )
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs">
                {SUPPORT_COMMERCE_ACTION_TYPES.map(
                  value => (
                    <option
                      key={value}
                      value={value}>
                      {value.replaceAll(
                        '_',
                        ' '
                      )}
                    </option>
                  )
                )}
              </select>

              {type ===
              'REFUND_REQUEST' ? (
                <input
                  value={amount}
                  onChange={event =>
                    setAmount(
                      event.target.value
                    )
                  }
                  inputMode="decimal"
                  placeholder="Requested amount"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs"
                />
              ) : null}

              <textarea
                value={reason}
                onChange={event =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="Reason and verified evidence"
                className="min-h-24 w-full resize-y rounded-xl border border-border bg-background p-3 text-xs leading-5"
              />

              <button
                type="button"
                disabled={
                  isPending ||
                  !reason.trim()
                }
                onClick={() =>
                  mutate(
                    {
                      action: 'prepare',
                      type,
                      reason,
                      requestedAmount:
                        amount.trim()
                          ? Number(amount)
                          : null
                    },
                    () => {
                      setReason('');
                      setAmount('');
                    }
                  )
                }
                className="h-10 w-full rounded-full bg-foreground px-4 text-xs font-bold text-background disabled:opacity-40">
                Prepare governed action
              </button>
            </div>
          ) : null}

          <div className="space-y-2 border-t border-border/60 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              Prepared actions
            </p>

            {snapshot.actions.map(
              action => (
                <article
                  key={action.id}
                  className="rounded-2xl border border-border/60 bg-background/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black">
                        {action.type.replaceAll(
                          '_',
                          ' '
                        )}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        {action.reason}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-[9px] font-black">
                      {action.status}
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] text-muted-foreground">
                    {dateFormatter.format(
                      new Date(
                        action.preparedAt
                      )
                    )}
                  </p>

                  {canApprove &&
                  action.status ===
                    'PREPARED' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          mutate({
                            action: 'approve',
                            actionId:
                              action.id
                          })
                        }
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-bold text-white">
                        <CheckCircle2 className="size-3" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          mutate({
                            action: 'reject',
                            actionId:
                              action.id
                          })
                        }
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-[10px] font-bold">
                        <XCircle className="size-3" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </article>
              )
            )}

            {!snapshot.actions.length ? (
              <p className="rounded-2xl border border-dashed border-border/70 p-4 text-center text-[11px] text-muted-foreground">
                No commerce action has been
                prepared.
              </p>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function SLAChip({
  label,
  state
}: {
  label: string;
  state: SupportSLAState;
}) {
  const Icon =
    state === 'BREACHED' ||
    state === 'AT_RISK'
      ? AlertTriangle
      : state === 'MET'
        ? CheckCircle2
        : Clock3;

  return (
    <div
      className={cn(
        'rounded-2xl border p-3',
        state === 'BREACHED'
          ? 'border-rose-500/30 bg-rose-500/10'
          : state === 'AT_RISK'
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-border/60 bg-background/50'
      )}>
      <Icon className="size-3.5" />
      <p className="mt-2 text-[10px] font-bold">
        {label}
      </p>
      <p className="mt-0.5 text-[9px] text-muted-foreground">
        {state.replaceAll('_', ' ')}
      </p>
    </div>
  );
}

function ContextRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof PackageCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-background">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold">
          {label}
        </p>
        <p className="truncate text-[9px] text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
