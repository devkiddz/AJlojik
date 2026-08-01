'use client';

import {
  useState
} from 'react';

import {
  useRouter
} from 'next/navigation';

import {
  CalendarClock,
  CirclePause,
  CirclePlay,
  LoaderCircle,
  PencilLine,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRoundCheck,
  XCircle
} from 'lucide-react';

import {
  Button
} from '@/components/ui/button';

import {
  StudioSelectField
} from '@/features/studio-controls';

import {
  operateAdminApproval
} from '@/features/admin/approvals/actions';

import type {
  ApprovalLifecycleOperation,
  ApprovalOperationsItem,
  ApprovalReviewerOption
} from '@/features/admin/approvals/approvalTypes';

import {
  useGlobalOverlay
} from '@/features/global-overlay';

const operationPresentation:
  Record<
    ApprovalLifecycleOperation,
    {
      label:
        string;
      description:
        string;
      icon:
        typeof ShieldCheck;
      destructive?:
        boolean;
    }
  > = {
    inspect: {
      label:
        'Begin inspection',
      description:
        'Claim the request and record that inspection has started.',
      icon:
        ShieldCheck
    },
    assign: {
      label:
        'Assign reviewer',
      description:
        'Choose the administrator responsible for this request.',
      icon:
        UserRoundCheck
    },
    'update-administration': {
      label:
        'Edit administration',
      description:
        'Update priority, deadline, reviewer, and internal notes.',
      icon:
        PencilLine
    },
    hold: {
      label:
        'Place on hold',
      description:
        'Pause review while information or a dependency is outstanding.',
      icon:
        CirclePause
    },
    reactivate: {
      label:
        'Reactivate',
      description:
        'Resume a paused live target or return a held, rejected, expired, or revision request to review.',
      icon:
        CirclePlay
    },
    'request-changes': {
      label:
        'Request changes',
      description:
        'Return the target to its Customer, Vendor, or administrator for revision.',
      icon:
        Send
    },
    approve: {
      label:
        'Approve and execute',
      description:
        'Approve the request and run its target-specific operation.',
      icon:
        ShieldCheck
    },
    reject: {
      label:
        'Reject request',
      description:
        'Reject the request and remove the target from active presentation.',
      icon:
        XCircle,
      destructive:
        true
    },
    pause: {
      label:
        'Pause live target',
      description:
        'Pause an already approved or executed target without deleting it.',
      icon:
        CirclePause
    },
    revert: {
      label:
        'Revert execution',
      description:
        'Restore the target snapshot captured before execution.',
      icon:
        RotateCcw,
      destructive:
        true
    },
    cancel: {
      label:
        'Cancel request',
      description:
        'Close the request without executing the target.',
      icon:
        XCircle,
      destructive:
        true
    }
  };

function localDateTime(
  value:
    string |
    null
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(
      value
    );

  const offset =
    date.getTimezoneOffset();

  return new Date(
    date.getTime() -
      offset *
        60_000
  )
    .toISOString()
    .slice(
      0,
      16
    );
}

export function ApprovalActionButton({
  item,
  operation,
  reviewers,
  compact = false
}: {
  item:
    ApprovalOperationsItem;
  operation:
    ApprovalLifecycleOperation;
  reviewers:
    ApprovalReviewerOption[];
  compact?:
    boolean;
}) {
  const {
    openOverlay
  } =
    useGlobalOverlay();

  const presentation =
    operationPresentation[
      operation
    ];

  const Icon =
    presentation.icon;

  if (
    operation ===
    'inspect'
  ) {
    return (
      <form
        action={
          operateAdminApproval
        }>
        <input
          type="hidden"
          name="id"
          value={
            item.id
          }
        />

        <input
          type="hidden"
          name="operation"
          value="inspect"
        />

        <Button
          type="submit"
          variant="outline"
          size={
            compact
              ? 'sm'
              : 'default'
          }>
          <Icon />

          {
            presentation.label
          }
        </Button>
      </form>
    );
  }

  function openOperation() {
    openOverlay({
      id:
        `approval-operation-${item.id}-${operation}`,
      eyebrow:
        'Approval operation',
      title:
        presentation.label,
      description:
        presentation.description,
      variant:
        'dialog',
      size:
        'md',
      content: (
        <ApprovalOperationForm
          item={
            item
          }
          operation={
            operation
          }
          reviewers={
            reviewers
          }
        />
      )
    });
  }

  return (
    <Button
      type="button"
      variant={
        presentation.destructive
          ? 'destructive'
          : operation ===
              'approve'
            ? 'default'
            : 'outline'
      }
      size={
        compact
          ? 'sm'
          : 'default'
      }
      onClick={
        openOperation
      }>
      <Icon />

      {
        presentation.label
      }
    </Button>
  );
}

function ApprovalOperationForm({
  item,
  operation,
  reviewers
}: {
  item:
    ApprovalOperationsItem;
  operation:
    ApprovalLifecycleOperation;
  reviewers:
    ApprovalReviewerOption[];
}) {
  const router =
    useRouter();

  const {
    closeOverlay
  } =
    useGlobalOverlay();

  const [
    submitting,
    setSubmitting
  ] =
    useState(
      false
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

  const presentation =
    operationPresentation[
      operation
    ];

  const Icon =
    presentation.icon;

  const administration =
    operation ===
      'update-administration' ||
    operation ===
      'assign';

  const needsNote =
    [
      'hold',
      'request-changes',
      'reject',
      'pause',
      'revert',
      'cancel'
    ].includes(
      operation
    );

  async function submit(
    formData:
      FormData
  ) {
    setSubmitting(
      true
    );

    setError(
      null
    );

    try {
      await operateAdminApproval(
        formData
      );

      closeOverlay();

      router.refresh();
    } catch (
      cause
    ) {
      setError(
        cause instanceof
        Error
          ? cause.message
          : 'The approval operation could not be completed.'
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <form
      action={
        submit
      }
      className="space-y-4">
      <input
        type="hidden"
        name="id"
        value={
          item.id
        }
      />

      <input
        type="hidden"
        name="operation"
        value={
          operation
        }
      />

      {administration ? (
        <label className="block space-y-2 text-xs font-bold">
          Assigned reviewer

          <StudioSelectField
            name="assignedReviewerId"
            defaultValue={
              item.assignedReviewer?.id ??
              ''
            }
            placeholder="Unassigned"
            options={[
              {
                value:
                  '',
                label:
                  'Unassigned'
              },
              ...reviewers.map(
                reviewer => ({
                  value:
                    reviewer.id,
                  label:
                    `${reviewer.name} · ${reviewer.role}`
                })
              )
            ]}
          />
        </label>
      ) : null}

      {operation ===
      'update-administration' ? (
        <>
          <label className="block space-y-2 text-xs font-bold">
            Priority

            <StudioSelectField
              name="priority"
              defaultValue={
                item.priority
              }
              options={[
                'LOW',
                'NORMAL',
                'HIGH',
                'URGENT'
              ].map(
                priority => ({
                  value:
                    priority,
                  label:
                    priority
                })
              )}
            />
          </label>

          <label className="block space-y-2 text-xs font-bold">
            Review deadline

            <input
              name="dueAt"
              type="datetime-local"
              defaultValue={localDateTime(
                item.dueAt
              )}
              className="h-11 w-full rounded-xl border border-border/70 bg-background px-3"
            />
          </label>
        </>
      ) : null}

      {operation ===
      'hold' ? (
        <label className="block space-y-2 text-xs font-bold">
          Optional hold-until
          time

          <input
            name="holdUntil"
            type="datetime-local"
            defaultValue={localDateTime(
              item.holdUntil
            )}
            className="h-11 w-full rounded-xl border border-border/70 bg-background px-3"
          />
        </label>
      ) : null}

      {operation !==
      'assign' ? (
        <label className="block space-y-2 text-xs font-bold">
          {operation ===
          'update-administration'
            ? 'Internal note'
            : 'Decision note'}

          <textarea
            name="note"
            rows={5}
            required={
              needsNote
            }
            defaultValue={
              operation ===
              'update-administration'
                ? item.internalNote ??
                  ''
                : ''
            }
            placeholder={
              needsNote
                ? 'Explain this decision clearly.'
                : 'Optional operational note'
            }
            className="w-full resize-y rounded-xl border border-border/70 bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </label>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-5 text-destructive">
          {error}
        </p>
      ) : null}

      <div className="sticky -bottom-5 -mx-4 -mb-5 mt-6 flex flex-col-reverse gap-2 border-t border-border/60 bg-popover/95 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6">
        <Button
          type="button"
          variant="outline"
          disabled={
            submitting
          }
          onClick={() =>
            closeOverlay()
          }>
          Close
        </Button>

        <Button
          type="submit"
          variant={
            presentation.destructive
              ? 'destructive'
              : 'default'
          }
          disabled={
            submitting
          }>
          {submitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Icon />
          )}

          Confirm{' '}
          {
            presentation.label.toLowerCase()
          }
        </Button>
      </div>
    </form>
  );
}
