import type {
  IntelligenceResolutionStatus
} from '../domain';

const LABELS:
  Record<
    IntelligenceResolutionStatus,
    string
  > = {
  COLLECTING:
    'Collecting',
  PLANNING:
    'Planning',
  READY:
    'Ready',
  AWAITING_REVIEW:
    'Review required',
  APPROVED:
    'Approved',
  EXECUTING:
    'Applying',
  APPLIED:
    'Completed',
  PARTIALLY_APPLIED:
    'Partially applied',
  BLOCKED:
    'Blocked',
  DISMISSED:
    'Dismissed',
  STALE:
    'Needs refresh',
  ARCHIVED:
    'Archived'
};

export function ResolutionStatusBadge({
  status
}: {
  status:
    IntelligenceResolutionStatus;
}) {
  const tone =
    status ===
      'APPLIED'
      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : status ===
          'BLOCKED'
        ? 'border-destructive/25 bg-destructive/10 text-destructive'
        : status ===
            'AWAITING_REVIEW'
          ? 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'border-primary/20 bg-primary/8 text-primary';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${tone}`}>
      {
        LABELS[
          status
        ]
      }
    </span>
  );
}
